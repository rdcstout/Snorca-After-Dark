'use strict';
const {app, BrowserWindow, ipcMain, dialog, shell, Menu} = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const {spawn} = require('node:child_process');
const {pathToFileURL} = require('node:url');
const engine = require('./engine.cjs');
const {SettingsStore, OperationGate, Diagnostics} = require('./runtime.cjs');
const {Updates}=require('./updates.cjs');
const page = pathToFileURL(path.join(__dirname, 'ui', 'index.html')).href;
app.setName('Snorca After Dark');
if (process.platform === 'win32') app.setAppUserModelId('therapy.extrusion.orca-dark-launcher');
// Keep the original identity and backup directory across the product rename.
app.setPath('userData', path.join(app.getPath('appData'), 'orca-dark-launcher'));
const settings = new SettingsStore(app.getPath('userData'));
const diagnostics = new Diagnostics(app.getPath('userData'));
const gate = new OperationGate();
const linux = process.platform === 'linux' ? require('./linux.cjs') : null;
const currentTarget = () => linux ? path.join(settings.value.appPath, 'web', 'flutter_web') : path.join(app.getPath('appData'), 'Snapmaker_Orca', 'web', 'flutter_web');
const checkRunning = () => engine.isRunning(process.platform, settings.value.appPath);
let updateService;
let win, theme, startupNotice = '', stateInFlight, lastState;

async function recoverLinuxSelection() {
  if(linux && settings.value.appPath && await engine.exists(path.join(settings.folder,'transaction.json'))) {
    if(await checkRunning())throw Error('Close Orca before recovering the interrupted theme operation.');
    await engine.recover(settings.folder,currentTarget());
  }
}
async function locate() {
  await recoverLinuxSelection();
  if (settings.value.appPath) {
    try { await engine.appBundle(settings.value.appPath); return; }
    catch { startupNotice = 'The saved Orca installation is unavailable. Choose its current location.'; }
  }
  if (linux) {
    const candidates = await linux.discover();
    await settings.update({appPath:candidates.length === 1 ? candidates[0] : '',autoOpen:false});
    if(candidates.length > 1) startupNotice = 'Multiple Orca profiles found. Choose the configuration folder for the installation you use.';
    return;
  }
  const candidates = process.platform === 'darwin'
    ? ['/Applications/Snapmaker Orca.app', '/Applications/Snapmaker_Orca.app', path.join(os.homedir(),'Applications','Snapmaker Orca.app')]
    : [process.env.ProgramFiles, process.env['ProgramFiles(x86)'], process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA,'Programs')]
      .filter(Boolean).flatMap(root => ['Snapmaker Orca','Snapmaker_Orca','Snapmaker Orca Slicer'].flatMap(folder =>
        ['snapmaker-orca.exe','Snapmaker_Orca.exe','Snapmaker Orca.exe'].map(file => path.join(root,folder,file))));
  for (const candidate of candidates) {
    try { await engine.appBundle(candidate); } catch { continue; }
    await settings.update({appPath:candidate});
    return;
  }
  if(settings.value.appPath) await settings.update({appPath:'',autoOpen:false});
}
async function inspectState() {
  const result = {appPath:settings.value.appPath, autoOpen:settings.value.autoOpen, running:null,
    patched:false,current:false,compatible:false,version:'',build:'',problem:'',platform:process.platform,appVersion:app.getVersion()};
  if (result.appPath) {
    try {
      const bundle = await engine.appBundle(result.appPath);
      Object.assign(result, await engine.inspect({bundle,target:currentTarget(),store:settings.folder,theme}));
    } catch(error) { result.problem = error.message; }
  }
  try { result.running = await checkRunning(); }
  catch { result.problem = 'Unable to check whether Orca is running. Close Orca and retry. No patch will run until this check succeeds.'; }
  lastState = result;
  return result;
}
async function state() {
  if (gate.busy && lastState) return {...lastState,busy:true};
  if (!stateInFlight) stateInFlight = inspectState().finally(() => {stateInFlight = null;});
  return stateInFlight;
}
async function openOrca() {
  if (linux) throw Error('Open Snapmaker Orca normally after applying. Linux beta does not launch Orca.');
  if (!settings.value.appPath) throw Error('Choose your Snapmaker Orca installation first.');
  await engine.appBundle(settings.value.appPath);
  const isMac = process.platform === 'darwin';
  await new Promise((resolve,reject) => {
    const child = spawn(isMac?'/usr/bin/open':settings.value.appPath, isMac?['-a',settings.value.appPath]:[], {
      cwd:path.dirname(settings.value.appPath),detached:true,stdio:'ignore',shell:false
    });
    child.once('error',reject);
    child.once('spawn',() => {child.unref();resolve();});
  });
}
async function perform(action) {
  return gate.run(async () => {
    await diagnostics.write('operation.start.' + action);
    try {
      if (action === 'open') { await openOrca(); return {message:'Orca launch requested. No files were changed.'}; }
      if (linux && !settings.value.appPath) throw Error('Choose your Orca configuration folder first.');
      if (linux && action === 'launch') throw Error('Use Apply theme, then open Orca normally.');
      if (action === 'restore') return await engine.restore({target:currentTarget(),store:settings.folder,check:checkRunning});
      if (!['apply','launch'].includes(action)) throw Error('Unknown action.');
      if (!settings.value.appPath) throw Error('Choose your Snapmaker Orca installation first.');
      const bundle = await engine.appBundle(settings.value.appPath);
      const result = await engine.apply({bundle,target:currentTarget(),store:settings.folder,theme,check:checkRunning});
      if (action === 'launch') {
        try {await openOrca();} catch(error) {throw Error('The theme was applied, but Orca could not be launched. Open Orca normally. ' + error.message);}
        result.message += ' Orca launch requested.';
      }
      return result;
    } catch(error) {await diagnostics.write('operation.error.'+action,error.code||'VALIDATION');throw error;}
    finally {await diagnostics.write('operation.finished.'+action);}
  });
}
function authorize(event) {
  if (!win || event.sender !== win.webContents || event.senderFrame !== win.webContents.mainFrame || event.senderFrame.url !== page) throw Error('Untrusted request.');
}
function showNotice(message) { if(win&&!win.isDestroyed())win.webContents.send('notice',message); }
async function revealDiagnostics() {
  await diagnostics.write('diagnostics.open');
  const error = await shell.openPath(settings.folder);
  if(error)showNotice('Could not open the diagnostics folder: '+error);
}
async function checkUpdates() {
  const result=await updateService.check(true);
  const available=result?.status==='available';
  const reply=await dialog.showMessageBox(win,{type:result?.status==='error'?'warning':'info',title:'Snorca After Dark updates',message:result?.message||'Unable to check updates.',buttons:available?['Open download','Later']:['OK'],defaultId:0,cancelId:available?1:0});
  if(available&&reply.response===0)await shell.openExternal(result.url);
}
async function start() {
  startupNotice = await settings.load();
  theme = await fs.readFile(path.join(__dirname,'theme.js'),'utf8');
  await locate();
  updateService=new Updates({settings,config:require('./release-channel.json'),current:app.getVersion(),platform:process.platform,arch:process.arch});
  win = new BrowserWindow({width:760,height:780,minWidth:620,minHeight:620,title:'Snorca After Dark',backgroundColor:'#12161e',
    webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true}});
  win.webContents.setWindowOpenHandler(() => ({action:'deny'}));
  win.webContents.on('will-navigate',(event,url) => {if(url!==page)event.preventDefault();});
  win.webContents.session.setPermissionRequestHandler((_wc,_permission,cb)=>cb(false));
  win.on('close',event => {if(gate.busy){event.preventDefault();showNotice('Wait for the current operation to finish before closing.');}});
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {label:'Snorca After Dark',submenu:[{role:'about'},{label:'Check for Updates…',click:()=>checkUpdates().catch(error=>showNotice(error.message))},{label:'Check weekly for updates',type:'checkbox',checked:settings.value.automaticUpdates,click:item=>settings.update({automaticUpdates:item.checked}).catch(error=>showNotice(error.message))},{label:'Open diagnostics and backups',click:revealDiagnostics},{type:'separator'},{role:'quit'}]},
    {role:'editMenu'},{role:'windowMenu'}
  ]));
  ipcMain.handle('state',async event => {authorize(event);return state();});
  ipcMain.handle('choose',async event => {
    authorize(event);
    const canceled = await gate.run(async () => {
      const isWindows = process.platform === 'win32';
      const choice = await dialog.showOpenDialog(win,{title:linux?'Choose the Snapmaker_Orca configuration folder':isWindows?'Choose the Snapmaker Orca installation folder':'Choose Snapmaker Orca',
        defaultPath:settings.value.appPath?(isWindows?path.dirname(settings.value.appPath):settings.value.appPath):undefined,
        properties:linux||isWindows?['openDirectory']:['openFile','openDirectory'], ...(linux?{defaultPath:settings.value.appPath||os.homedir(),properties:['openDirectory','showHiddenFiles']}:{})});
      if(choice.canceled||!choice.filePaths.length)return true;
      const selected = isWindows?await engine.executableInFolder(choice.filePaths[0]):choice.filePaths[0];
      await engine.appBundle(selected);
      await recoverLinuxSelection();
      await settings.update({appPath:selected});
      await diagnostics.write('installation.selected');
      return false;
    });
    return {...await state(),canceled};
  });
  ipcMain.handle('action',async(event,action) => {authorize(event);if(!['apply','launch','restore','open'].includes(action))throw Error('Invalid action.');return perform(action);});
  ipcMain.handle('autoOpen',async(event,value) => {authorize(event);if(typeof value!=='boolean')throw Error('Invalid preference.');return gate.run(async()=>{await settings.update({autoOpen:value});return {autoOpen:value};});});
  ipcMain.handle('diagnostics',async event=>{authorize(event);await revealDiagnostics();});
  await win.loadFile(path.join(__dirname,'ui','index.html'));
  if(startupNotice)showNotice(startupNotice);
  if(!linux&&settings.value.autoOpen&&!startupNotice) {
    try { const result = await perform('launch'); showNotice(result.message); }
    catch(error) {showNotice(error.message);}
  }
  const automaticCheck=()=>updateService.check(false).then(result=>{if(result)showNotice(result.message+' Choose Check for Updates from the app menu to download.');}).catch(()=>{});
  automaticCheck();setInterval(automaticCheck,60000).unref();
  await diagnostics.write('application.ready');
}
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance',()=>{win?.show();win?.focus();});
  app.whenReady().then(start).catch(async error => {
    await diagnostics.write('startup.error',error.code||'STARTUP');
    dialog.showErrorBox('Snorca After Dark could not start',error.message);app.quit();
  });
}
app.on('window-all-closed',()=>app.quit());

const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),vm=require('node:vm');
const {EventEmitter}=require('node:events');
const E=require('../engine.cjs');
const source=process.env.ORCA_FIXTURE;
async function setup(t,{single=true}={}) {
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'snorca-main-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const install=path.join(root,'programs','Snapmaker Orca'),bundle=path.join(install,'resources','web','flutter_web');
 await fs.mkdir(bundle,{recursive:true});await fs.writeFile(path.join(install,'snapmaker-orca.exe'),'fixture');
 for(const f of [...E.FILES,'version.json']){await fs.mkdir(path.dirname(path.join(bundle,f)),{recursive:true});await fs.copyFile(path.join(source,f),path.join(bundle,f));}
 const ipc=new Map(),appEvents=new Map();let window,ready,quit=false,pickerOptions;
 const app={getPath:()=>path.join(root,'data'),setPath(){},setName(){},setAppUserModelId(id){assert.equal(id,"therapy.extrusion.orca-dark-launcher");},getVersion:()=> '0.2.0',requestSingleInstanceLock:()=>single,
 on:(event,fn)=>appEvents.set(event,fn),quit(){quit=true;},whenReady:()=>({then(fn){ready=fn();return ready;}})};
 class Window {
  constructor(){window=this;this.events={};this.webContents={mainFrame:{url:require('node:url').pathToFileURL(path.join(__dirname,'../ui/index.html')).href},session:{setPermissionRequestHandler(){}},setWindowOpenHandler(){},on(){},send(){}};}
  on(event,fn){this.events[event]=fn;} isDestroyed(){return false;} async loadFile(){} show(){} focus(){}
 }
 const electron={app,BrowserWindow:Window,ipcMain:{handle:(name,fn)=>ipc.set(name,fn)},Menu:{buildFromTemplate:x=>x,setApplicationMenu(){}},shell:{openPath:async()=>''},dialog:{showErrorBox(title,message){throw Error(title+': '+message);},showOpenDialog:async(_win,options)=>{pickerOptions=options;return{canceled:false,filePaths:[install]};}}};
 const spawn=()=>{const child=new EventEmitter();child.unref=()=>{};queueMicrotask(()=>child.emit('spawn'));return child;};
 const req=name=>name==='electron'?electron:name==='./engine.cjs'?{...E,appBundle:p=>E.appBundle(p,'win32'),isRunning:async()=>false}:name==='./runtime.cjs'?require('../runtime.cjs'):name==='./updates.cjs'?require('../updates.cjs'):name==='./release-channel.json'?{repository:null,channel:'stable'}:name==='node:child_process'?{spawn}:require(name);
 vm.runInNewContext(await fs.readFile(path.join(__dirname,'../main.cjs'),'utf8'),{require:req,__dirname:path.join(__dirname,'..'),process:{platform:'win32',arch:'x64',env:{ProgramFiles:path.join(root,'programs')}},console,setInterval:()=>({unref(){}})});
 if(ready)await ready;
 const invoke=(name,...args)=>ipc.get(name)({sender:window.webContents,senderFrame:window.webContents.mainFrame},...args);
 return {invoke,ipc,window,root,bundle,getPicker:()=>pickerOptions,quit:()=>quit};
}
test('Windows IPC flow detects vendor EXE, chooses a folder, applies and restores',async t=>{
 const a=await setup(t);const before=await a.invoke('state');assert.match(before.appPath,/snapmaker-orca.exe$/);assert.equal(before.compatible,true);
 await a.invoke('choose');assert.deepEqual(Array.from(a.getPicker().properties),['openDirectory']);
 await a.invoke('action','apply');assert.equal((await a.invoke('state')).current,true);
 await a.invoke('action','restore');assert.equal((await a.invoke('state')).patched,false);
});
test('IPC refuses a request from another renderer even with the same URL',async t=>{const a=await setup(t);await assert.rejects(a.ipc.get('action')({sender:{},senderFrame:a.window.webContents.mainFrame},'apply'),/Untrusted/);});
test('a second instance quits without registering IPC or creating a window',async t=>{const a=await setup(t,{single:false});assert.equal(a.quit(),true);assert.equal(a.ipc.size,0);assert.equal(a.window,undefined);});

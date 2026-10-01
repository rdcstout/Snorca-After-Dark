'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFile} = require('node:child_process');
const {promisify} = require('node:util');
const run = promisify(execFile);
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const V240=require('./web240.cjs');
const ICONS=['assets/assets/svgs/device/keyboardArrowDropDown.svg','assets/assets/svgs/device/pause.svg'];
const FILES = ['index.html','main.dart.js','flutter_bootstrap.js',...ICONS];
const KNOWN = {
 'assets/assets/svgs/device/keyboardArrowDropDown.svg':'affc57460695dbfce0a341f819a24ddc644bddf35466fefd2fa6a94910bcf661',
 'assets/assets/svgs/device/pause.svg':'a928f3023ecc692858434247a28ad43e5bcf38f1dbe2e29b1ddaed781a95f1f7',
 'main.dart.js':'a732c6d94d7746441bd75d120055592993a6427ded763449ba16836914e48f0c',
 'index.html':'2ed6e836594554d62088517af8dce280621ca3698e620d7a2f1fa61d9d5fcef8',
 'flutter_bootstrap.js':'b9e2e3b6ef05e43c949918766301dc31febb94c4d38c85dea29622f4478e6c39'
};
const WINDOWS_KNOWN = {
 'main.dart.js':'5d9ef1810174e1a22d75a168e5c148fc1fa3574f80f4531a249e3e67b578383b',
 'index.html':'041edf02a21b0f7e36c17e9526f14721ec1d52f3142a0b0e0578b9764695d42a',
 'flutter_bootstrap.js':'1917b9c73f5b4dbc9d9e31053a72c4780813c2bf27f206a61b130229eb7c45fb',
 'assets/assets/svgs/device/pause.svg':'c5401c0f93f86ee0976b92a14e74bd2897b3478bd138b6af761e6d56e89e7402',
 'assets/assets/svgs/device/keyboardArrowDropDown.svg':'399efeb691563706d53d2edf14b5b6348255ac63814814d789781961b47ee5a9'
};
const isKnown = (file, bytes) => [KNOWN[file], WINDOWS_KNOWN[file], V240.KNOWN[file], V240.WINDOWS_KNOWN[file]].includes(hash(bytes));
const MARKER = '.orca-dark-launcher.json';
const OLD = 'case 0:q.a=q.b=!1\nA.GP("[ThemeVM] toggleTheme, isDark: false, isSystemTheme: false")';
const NEW = 'case 0:q.a=!1;q.b=(["0","2"].includes(new URLSearchParams(window.location.search).get("path")))\nA.GP("[ThemeVM] Orca Dark Launcher")';
async function exists(p) {try {await fs.access(p); return true;} catch(e) {if(e.code==='ENOENT') return false; throw e;}}
async function json(p) {return JSON.parse(await fs.readFile(p,'utf8'));}
async function safeDir(p) {const s=await fs.lstat(p); if(!s.isDirectory()||s.isSymbolicLink()) throw Error('Expected an ordinary folder: '+p);}
async function version(dir) {
 const v=await json(path.join(dir,'version.json'));
 if(!/^\d+$/.test(String(v.build_number)) || typeof v.version!=='string') throw Error('Unrecognized Orca web version. Nothing changed.');
 return v;
}
async function fileList(dir) {return await exists(path.join(dir,V240.main))?V240.FILES:FILES;}
async function readFiles(dir) {await safeDir(dir);const out={}; for(const f of await fileList(dir)) {const p=path.join(dir,f);const s=await fs.lstat(p);if(!s.isFile()||s.isSymbolicLink())throw Error('Unexpected web file: '+f);out[f]=await fs.readFile(p);} return out;}
function patch(original, theme) {
 if(original[V240.main])return V240.patch(original,theme,hash);
 for(const f of FILES) if(!isKnown(f,original[f])) throw Error('This Orca web build is not supported yet (or its files were edited). Nothing changed.');
 let main=original['main.dart.js'].toString().replace(/\r\n/g,'\n');
 if(main.split(OLD).length!==2) throw Error('Theme hook does not match. Nothing changed.');
 // Presentation-only fixes for the exact supported compiled web build.
 const scoped=(name,end,from,to)=>{
  const start=main.indexOf(name),stop=main.indexOf(end,start+name.length);
  if(start<0||stop<0)throw Error('Control theme section missing.');
  const section=main.slice(start,stop);
  if(!section.includes(from))throw Error('Control theme colors changed.');
  main=main.slice(0,start)+section.split(from).join(to)+main.slice(stop);
 };
 scoped('A.af5.prototype={','A.RZ.prototype=', 's=i?B.u:B.mu','s=window.__orcaDarkActive?(i?new A.H(0xff3e3e45):new A.H(0xff333337)):(i?B.u:B.mu)');
 scoped('A.LV.prototype={','A.azA.prototype=', 'A.u(a).ax.c','(window.__orcaDarkActive?new A.H(0xff3e3e45):A.u(a).ax.c)');
 scoped('A.V2.prototype={','A.b9k.prototype=', 'new A.aQ(B.qY,','new A.aQ(window.__orcaDarkActive?new A.H(0xff3e3e45):B.qY,');
 // The left printer popup paints its own white rounded surface.
 scoped('A.bik.prototype={','A.bij.prototype=', 'new A.aQ(B.u,q,q,n,q,q,q,B.C)', 'new A.aQ(window.__orcaDarkActive?new A.H(0xff2d2d31):B.u,q,q,n,q,q,q,B.C)');
 // Match native StateColor.cpp surfaces, including Flutter canvas backgrounds.
 for(const [from,to] of [['B.qH=new A.H(4280494125)','B.qH=new A.H(window.__orcaDarkActive?0xff2d2d31:4280494125)'],['B.Zg=new A.H(4280296231)','B.Zg=new A.H(window.__orcaDarkActive?0xff242428:4280296231)']]){
  if(main.split(from).length!==2)throw Error('Surface theme colors changed.');
  main=main.replace(from,to);
 }
 const html=original['index.html'].toString();
 if(html.split('</head>').length!==2) throw Error('HTML hook does not match. Nothing changed.');
 const icons={};
 for(const f of ICONS){const svg=original[f].toString();if(!svg.includes('fill="#333333"'))throw Error('Icon colors changed. Nothing changed.');icons[f]=Buffer.from(svg.replaceAll('fill="#333333"','fill="#EFEFF0"'));}
 return {
  ...icons,
  'main.dart.js':Buffer.from(main.replace(OLD,NEW)),
  'index.html':Buffer.from(html.replace('src="flutter_bootstrap.js"','src="flutter_bootstrap.js?orcaDark='+hash(theme+main).slice(0,12)+'"').replace('</head>','<!-- Orca Dark Launcher -->\n<script>\n'+theme+'\n</script>\n</head>')),
  // A distinct entry point avoids reusing an older browser-cached script.
  'flutter_bootstrap.js':Buffer.from(original['flutter_bootstrap.js'].toString().replace('"mainJsPath":"main.dart.js"','"mainJsPath":"main.dart.js?orcaDark='+hash(theme+main.replace(OLD,NEW)).slice(0,12)+'"'))
 };
}
async function appBundle(appPath, platform=process.platform) {
 if(!await exists(appPath))throw Error('The selected Snapmaker Orca installation is missing. Choose its current location.');
 if(platform==='darwin' && !await exists(path.join(appPath,'Contents','MacOS','Snapmaker_Orca')))throw Error('Select the installed Snapmaker Orca application.');
 if(platform==='win32' && (!/\.exe$/i.test(appPath)||!(await fs.stat(appPath)).isFile()))throw Error('Choose the application EXE inside your installed Snapmaker Orca folder.');
 if(platform==='linux')return require('./linux.cjs').webResources(appPath);
 const root=platform==='darwin'?path.join(appPath,'Contents','Resources'):path.dirname(appPath);
 for(const p of [path.join(root,'web','flutter_web'),path.join(root,'resources','web','flutter_web'),path.join(root,'Resources','web','flutter_web')]) if(await exists(path.join(p,'version.json')) && (await exists(path.join(p,'main.dart.js'))||await exists(path.join(p,V240.main))) && await exists(path.join(p,'index.html'))) return p;
 throw Error('The selected application has no Orca web resources beside it. Choose the installed application, not its downloaded installer.');
}
async function executableInFolder(folder) {
 await safeDir(folder);
 const entries=await fs.readdir(folder,{withFileTypes:true});
 const candidates=entries.filter(e=>e.isFile()&&/orca.*\.exe$/i.test(e.name)&&!/(uninstall|setup|console|helper)/i.test(e.name)).map(e=>path.join(folder,e.name));
 const valid=[];
 for(const candidate of candidates){try{await appBundle(candidate,'win32');valid.push(candidate);}catch{}}
 const official=valid.find(p=>path.basename(p).toLowerCase()==='snapmaker-orca.exe');
 if(official)return official;
 if(valid.length===1)return valid[0];
 if(valid.length>1)throw Error('More than one Orca application is in this folder. Select the installation folder for the version you use.');
 throw Error('No installed Orca application was found in this folder. Select the folder containing the installed Orca application.');
}
function matchesWindowsProcess(stdout, executable='') {
 const names=new Set(['snapmaker-orca.exe','snapmaker_orca.exe','snapmaker orca.exe',...(executable?[path.win32.basename(executable).toLowerCase()]:[])]);
 return stdout.split(/\r?\n/).some(line=>{const match=line.match(/^"([^"]+)"/);return match&&names.has(match[1].toLowerCase());});
}
async function isRunning(platform=process.platform, executable='') {
 const {stdout}=platform==='win32'?await run('tasklist',['/FO','CSV','/NH'],{windowsHide:true,timeout:10000}):await run('/bin/ps',['-axo','comm='],{timeout:10000});
 if(platform==='linux')return require('./linux.cjs').matchesProcess(stdout);
 return platform==='win32'?matchesWindowsProcess(stdout,executable):stdout.split('\n').some(x=>['Snapmaker_Orca','Snapmaker Orca'].includes(path.basename(x.trim())));
}
async function ensureStopped(check) {if(await check())throw Error('Quit Snapmaker Orca first, then try again. The launcher never closes a print session for you.');}
async function recover(store,target) {
 const p=path.join(store,'transaction.json'); if(!await exists(p))return;
 const j=await json(p);
 if(!j||typeof j.target!=='string'||typeof j.old!=='string'||typeof j.stage!=='string')throw Error('Invalid recovery record. Nothing changed.');
 const parent=path.dirname(target);
 if(j.target!==target||path.dirname(j.old)!==parent||path.dirname(j.stage)!==parent||!path.basename(j.old).startsWith('.orca-dark-old-')||!path.basename(j.stage).startsWith('.orca-dark-stage-')) throw Error('Recovery record needs inspection. Nothing changed.');
 for(const dir of [target,j.old,j.stage])if(await exists(dir))await safeDir(dir);
 if(!await exists(target)&&await exists(j.old)) await fs.rename(j.old,target);
 if(!await exists(target)&&j.hadTarget===false){for(const dir of [j.old,j.stage])await fs.rm(dir,{recursive:true,force:true});await fs.unlink(p);return;}
 if(!await exists(target)) throw Error('Resources are missing after an interrupted operation; restore Orca resources before continuing.');
 for(const extra of [j.old,j.stage]) if(await exists(extra))await fs.rm(extra,{recursive:true});
 await fs.unlink(p);
}
async function treeDigest(dir) {
 await safeDir(dir);
 const records=[];
 async function walk(root,relative='') {
  const entries=(await fs.readdir(root,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name));
  for(const e of entries){
   const name=path.join(relative,e.name),full=path.join(root,e.name);
   if(e.isSymbolicLink())throw Error('Linked web resources are not supported. Nothing changed.');
   if(e.isDirectory()){records.push(['dir',name]);await walk(full,name);}
   else if(e.isFile())records.push(['file',name,hash(await fs.readFile(full))]);
   else throw Error('Unexpected web resource. Nothing changed.');
  }
 }
 await walk(dir);return hash(JSON.stringify(records));
}
async function transaction(source,target,store,edit,check,expectedSource) {
 await safeDir(source);
 const beforeSource=await treeDigest(source);
 if(expectedSource && beforeSource!==expectedSource)throw Error('Orca resources changed during validation. Try again after Orca has closed.');
 const hadTarget=await exists(target),beforeTarget=hadTarget?await treeDigest(target):null;
 const id=crypto.randomUUID(),parent=path.dirname(target),stage=path.join(parent,'.orca-dark-stage-'+id),old=path.join(parent,'.orca-dark-old-'+id);
 await fs.mkdir(parent,{recursive:true});
 let committed=false,journalWritten=false;
 try {
  await fs.cp(source,stage,{recursive:true,errorOnExist:true,force:false});
  if(await treeDigest(stage)!==beforeSource)throw Error('Orca resources changed while being copied. Nothing changed.');
  await edit(stage);
  await ensureStopped(check);
  if(await treeDigest(source)!==beforeSource || (await exists(target))!==hadTarget || (hadTarget&&await treeDigest(target)!==beforeTarget))throw Error('Orca resources changed during preparation. Nothing changed; try again.');
  const j=path.join(store,'transaction.json'),tmp=j+'.tmp';
  await fs.writeFile(tmp,JSON.stringify({target,stage,old,hadTarget}),{mode:0o600});await fs.rename(tmp,j);journalWritten=true;
  if(hadTarget)await fs.rename(target,old);
  try {await fs.rename(stage,target);committed=true;}catch(error){if(hadTarget)await fs.rename(old,target);throw error;}
  await fs.rm(old,{recursive:true,force:true});await fs.unlink(j);
 } catch(error) {
  if(!committed){await fs.rm(stage,{recursive:true,force:true});if(journalWritten&&(!hadTarget||await exists(target)))await fs.rm(path.join(store,'transaction.json'),{force:true});throw error;}
  // A committed patch is usable even if Windows temporarily locks a cleanup file.
  return {cleanupPending:true};
 }
 return {cleanupPending:false};
}
async function backup(dir,store,files,v) {
 const id=hash(JSON.stringify(v)+Object.keys(files).map(f=>hash(files[f])).join(''));
 const dest=path.join(store,'backups',id);
 if(await exists(dest)) {
  const saved=await readFiles(dest);
  if(Object.keys(files).some(f=>hash(saved[f])!==hash(files[f])))throw Error('The existing restore backup is damaged. Nothing changed. Inspect the backup folder before trying again.');
 }
 if(!await exists(dest)) {
  await fs.mkdir(path.dirname(dest),{recursive:true});const temp=dest+'.'+crypto.randomUUID();await fs.mkdir(temp,{mode:0o700});
  for(const f of Object.keys(files)){await fs.mkdir(path.dirname(path.join(temp,f)),{recursive:true});await fs.writeFile(path.join(temp,f),files[f]);}
  await fs.writeFile(path.join(temp,'version.json'),JSON.stringify(v));
  await fs.rename(temp,dest);
 }
 return id;
}
async function originals(source,store) {
 const files=await readFiles(source);
 if(!await exists(path.join(source,MARKER)))return files;
 const m=await json(path.join(source,MARKER));
 if(!/^[a-f0-9]{64}$/.test(m.backup))throw Error('Invalid restore record. Nothing changed.');
 for(const f of Object.keys(files)) if(m.patched?.[f]?hash(files[f])!==m.patched[f]:!isKnown(f,files[f]))throw Error('Orca web files changed after applying the theme. Nothing changed; inspect before restoring.');
 const actualVersion=await version(source);
 if(JSON.stringify(actualVersion)!==JSON.stringify(m.version))throw Error('Orca web version changed after applying the theme. Nothing changed.');
 const original={};
 for(const f of Object.keys(files)){const saved=path.join(store,'backups',m.backup,f);if(await exists(saved))original[f]=await fs.readFile(saved);else if(!m.patched?.[f]&&isKnown(f,files[f]))original[f]=files[f];else throw Error('Restore backup is incomplete. Nothing changed.');}
 for(const f of Object.keys(files))if(!isKnown(f,original[f]))throw Error('Restore backup failed verification. Nothing changed.');
 return original;
}
async function inspect({bundle,target,store,theme}) {
 const bv=await version(bundle),tv=await exists(target)?await version(target):null;
 const source=!tv||String(bv.build_number)>String(tv.build_number)?bundle:target;
 const selected=source===bundle?bv:tv;
 const original=await originals(source,store);
 const expected=patch(original,theme);
 const installed=source===target&&await exists(path.join(target,MARKER));
 const current=installed?await readFiles(target):null;
 return {version:selected.version,build:selected.build_number,compatible:true,patched:!!installed,current:!!current&&Object.keys(expected).every(f=>hash(current[f])===hash(expected[f]))};
}
async function apply({bundle,target,store,theme,check=isRunning}) {
 await ensureStopped(check);await fs.mkdir(store,{recursive:true,mode:0o700});await recover(store,target);
 const bv=await version(bundle);const tv=await exists(target)?await version(target):null;
 const source=!tv||String(bv.build_number)>String(tv.build_number)?bundle:target;
 const v=source===bundle?bv:tv;
 const expectedSource=await treeDigest(source);
 const original=await originals(source,store),patched=patch(original,theme);
 const id=await backup(source,store,original,v);
 if(source===target && await exists(path.join(target,MARKER))) {
  const current=await readFiles(target);
  if(Object.keys(patched).every(f=>hash(current[f])===hash(patched[f])))return {message:'Dark mode is already applied.',version:v.version};
 }
 const result=await transaction(source,target,store,async stage=>{
  for(const f of Object.keys(patched))await fs.writeFile(path.join(stage,f),patched[f]);
  await fs.writeFile(path.join(stage,MARKER),JSON.stringify({schema:1,backup:id,version:v,patched:Object.fromEntries(Object.keys(patched).map(f=>[f,hash(patched[f])]))}));
 },check,expectedSource);
 return {message:'Dark mode applied. Open Orca to use it.'+(result.cleanupPending?' Cleanup will finish on the next run.':''),version:v.version};
}
async function restore({target,store,check=isRunning}) {
 await ensureStopped(check);await fs.mkdir(store,{recursive:true,mode:0o700});await recover(store,target);
 if(!await exists(path.join(target,MARKER)))return {message:'No launcher patch is installed. Current Orca files were kept.'};
 const expectedSource=await treeDigest(target);
 const original=await originals(target,store);
 const result=await transaction(target,target,store,async stage=>{for(const f of Object.keys(original))await fs.writeFile(path.join(stage,f),original[f]);await fs.unlink(path.join(stage,MARKER));},check,expectedSource);
 return {message:'Original web files restored. Open Orca normally.'+(result.cleanupPending?' Cleanup will finish on the next run.':'')};
}
module.exports={recover,inspect,WINDOWS_KNOWN,isKnown,treeDigest,transaction,executableInFolder,matchesWindowsProcess,apply,restore,appBundle,isRunning,version,exists,patch,hash,KNOWN,FILES,MARKER};

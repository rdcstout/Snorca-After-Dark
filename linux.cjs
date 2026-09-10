'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const APP_ID='io.github.Snapmaker.Snapmaker_Orca';
async function webResources(folder) {
 if(!path.isAbsolute(folder))throw Error('Choose an absolute Orca configuration folder.');
 const root=await fs.lstat(folder);
 if(!root.isDirectory()||root.isSymbolicLink())throw Error('Choose an ordinary Orca configuration folder.');
 const web=path.join(folder,'web');
 const st=await fs.lstat(web).catch(()=>null);
 if(!st?.isDirectory()||st.isSymbolicLink())throw Error('Open Snapmaker Orca once, close it, then choose its configuration folder containing web/flutter_web.');
 const target=path.join(web,'flutter_web');
 const info=await fs.lstat(target).catch(()=>null);
 if(!info?.isDirectory()||info.isSymbolicLink())throw Error('No initialized Orca web interface found. Open Orca once and close it before applying.');
 for(const file of ['version.json','main.dart.js','index.html']) {
  const entry=await fs.lstat(path.join(target,file)).catch(()=>null);
  if(!entry?.isFile()||entry.isSymbolicLink())throw Error('The selected folder does not contain ordinary Orca web resources. Nothing changed.');
 }
 return target;
}
function candidates(home=os.homedir(),env=process.env) {
 const config=env.XDG_CONFIG_HOME && path.isAbsolute(env.XDG_CONFIG_HOME)?env.XDG_CONFIG_HOME:path.join(home,'.config');
 return [...new Set([path.join(config,'Snapmaker_Orca'),path.join(home,'.var','app',APP_ID,'config','Snapmaker_Orca')])];
}
async function discover(home,env) {
 const found=[];
 for(const folder of candidates(home,env)){try{await webResources(folder);found.push(folder);}catch(error){if(error.code && error.code!=='ENOENT')throw error;}}
 return found;
}
function matchesProcess(stdout) {
 return stdout.split('\n').some(line=>['snapmaker-orca','Snapmaker_Orca','Snapmaker Orca'].includes(path.basename(line.trim()).replace(/ \(deleted\)$/,'')));
}
module.exports={webResources,candidates,discover,matchesProcess};

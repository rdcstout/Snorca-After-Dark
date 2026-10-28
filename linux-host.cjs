'use strict';
// Flatpak's installation directories are reserved. Run the same verified engine
// on the host, with a fixed operation allowlist and no shell interpolation.
const {execFile}=require('node:child_process'),{promisify}=require('node:util');
const path=require('node:path'),fs=require('node:fs/promises');
const run=promisify(execFile);
async function request(method,args=[]) {
 const info=await fs.readFile('/.flatpak-info','utf8');
 const appPath=info.match(/^app-path=(.+)$/m)?.[1];
 if(!appPath||!path.isAbsolute(appPath))throw Error('Cannot locate this Flatpak installation.');
 const root=path.join(appPath,'lib/therapy.extrusion.orca_dark_launcher');
 const binary=path.join(root,'snorca-after-dark'),helper=path.join(root,'resources/app.asar/linux-helper.cjs');
 const {stdout}=await run('flatpak-spawn',['--host','--env=ELECTRON_RUN_AS_NODE=1',binary,helper,JSON.stringify({method,args})],{timeout:120000,maxBuffer:1024*1024});
 const reply=JSON.parse(stdout);
 if(reply.error)throw Error(reply.error);
 return reply.result;
}
function proxy(engine) {
 return {...engine,...Object.fromEntries(['appBundle','isRunning','exists','recover','inspect','apply','restore'].map(method=>[method,(...args)=>request(method,args)]))};
}
module.exports={request,proxy};

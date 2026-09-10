'use strict';
const $ = id => document.getElementById(id);
const buttons = ['launch','apply','restore','open','choose','diagnostics'];
let working = false, initialized = false, refreshing = false, generation = 0;
function notice(text,error=false) {
  const clean = String(text).replace(/^Error invoking remote method '[^']+': Error: /,'');
  $('status').textContent = (error?'Error: ':'') + clean;
  $('status').classList.toggle('error',error);
  initialized = true;
}
function setWorking(value) {
  working = value;
  for(const id of buttons)$(id).disabled=value;
  $('autoOpen').disabled=value;
}
async function refresh() {
  if(refreshing||working)return;
  refreshing=true;
  const current=generation;
  try {
    const s=await window.launcher.state();
    if(current!==generation||working)return;
    $('appPath').textContent=s.appPath||'Select your Snapmaker Orca installation';
    $('badge').textContent=s.problem?'Needs attention':s.current?'Dark theme current':s.patched?'Theme update available':s.appPath?'Ready':'Choose Orca';
    $('details').textContent=s.version?`Web ${s.version} · Build ${s.build}`:(s.platform==='win32'?'Choose the folder containing snapmaker-orca.exe.':'Choose the installed Snapmaker Orca app.');
    $('autoOpen').checked=s.autoOpen;
    $('version').textContent=`Version ${s.appVersion||'0.2.0'}`;
    $('availability').textContent=s.problem || (s.current ? (s.running===true?'Dark theme is applied. Orca is open. You can close Snorca After Dark.':'Dark theme is applied. You can close Snorca After Dark.') : s.running===true?'Orca is open. Close it before applying or restoring.':s.running===null?'Orca process status is unavailable.':!s.appPath?'Choose your Snapmaker Orca installation before applying.':'Orca is closed. The web files are compatible.');
    if(!initialized)notice(s.current?'The current dark theme is verified.':'Choose Apply & open Orca to use the dark theme.');
    if(s.busy) {
      for(const id of buttons)$(id).disabled=true;
      $('autoOpen').disabled=true;
      $('availability').textContent='An operation is in progress. Please wait.';
    } else setWorking(false);
  } catch(error) {if(current===generation&&!working)notice(error.message,true);}
  finally {refreshing=false;}
}
async function run(operation,progress) {
  if(working)return;
  generation++;
  setWorking(true);
  notice(progress);
  try { await operation(); }
  catch(error) {notice(error.message,true);}
  finally {setWorking(false);generation++;refresh();}
}
for(const action of ['launch','apply','restore','open'])$(action).addEventListener('click',()=>run(async()=>{
  const result=await window.launcher.action(action);notice(result.message);
},action==='restore'?'Verifying the backup and restoring original files…':action==='open'?'Requesting Orca launch…':'Verifying web files, saving a backup, and applying the theme…'));
$('choose').addEventListener('click',()=>run(async()=>{
  const result=await window.launcher.choose();
  notice(result.canceled?'Selection canceled.':result.problem||'Installation selected. Click Apply & open Orca.',!!result.problem);
},'Choose your Snapmaker Orca installation…'));
$('autoOpen').addEventListener('change',()=>run(async()=>{
  const result=await window.launcher.autoOpen($('autoOpen').checked);
  $('autoOpen').checked=result.autoOpen;
  notice(result.autoOpen?'This launcher will apply the theme and request Orca launch when opened.':'Automatic launch is off.');
},'Saving preference…'));
$('diagnostics').addEventListener('click',()=>run(async()=>{
  await window.launcher.diagnostics();notice('Opened the diagnostics and backup folder.');
},'Opening diagnostics…'));
window.launcher.onNotice(text=>{generation++;notice(text);});
refresh();
setInterval(refresh,3000);

'use strict';
const semver=require('semver');
const WEEK=7*24*60*60*1000;
function eligibleRelease(releases,{repository,current,platform,arch,channel='stable'}) {
 if(!semver.valid(current))throw Error('The installed version cannot be compared.');
 if(!Array.isArray(releases))throw Error('The update service returned invalid data.');
 const suffix=platform==='win32'?`${arch}.exe`:platform==='darwin'?`mac-${arch}.dmg`:platform==='linux'?`linux-${arch}.AppImage`:null;
 if(!suffix)throw Error('No update package is configured for this platform.');
 const candidates=[];
 for(const release of releases){
  const version=semver.valid(String(release.tag_name||'').replace(/^v/,''));
  if(release.draft||!version||(channel==='stable'&&(release.prerelease||semver.prerelease(version))))continue;
  const name=platform==='win32'?`Snorca-After-Dark-Setup-${version}-${suffix}`:`Snorca-After-Dark-${version}-${suffix}`;
  const asset=release.assets?.find(a=>a.name===name);
  if(!asset)continue;
  let url;try{url=new URL(asset.browser_download_url);}catch{continue;}
  if(url.protocol!=='https:'||url.hostname!=='github.com'||url.username||url.password||!url.pathname.startsWith(`/${repository}/releases/download/`))continue;
  candidates.push({version,url:url.href});
 }
 candidates.sort((a,b)=>semver.rcompare(a.version,b.version));
 if(!candidates.length)return {status:'unavailable',message:'No compatible published update is available for this platform and channel.'};
 const newest=candidates[0];
 return semver.gt(newest.version,current)?{status:'available',...newest,message:`Version ${newest.version} is available.`}:{status:'current',message:'You have the latest compatible published version.'};
}
class Updates {
 constructor({settings,config,current,platform,arch,fetcher=fetch,now=Date.now}){Object.assign(this,{settings,config,current,platform,arch,fetcher,now});this.pending=null;this.available=null;}
 async check(manual=false){
  if(this.pending){await this.pending;return manual?this.check(true):null;}
  if(!manual&&(!this.settings.value.automaticUpdates||(this.now()>=this.settings.value.lastUpdateAttempt&&this.now()-this.settings.value.lastUpdateAttempt<WEEK)))return null;
  this.pending=this.perform(manual).finally(()=>{this.pending=null;});return this.pending;
 }
 async perform(manual){
  await this.settings.update({lastUpdateAttempt:this.now()});
  if(!this.config.repository)return manual?{status:'unconfigured',message:'Updates have not been published for this local validation build. No update channel is configured.'}:null;
  if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(this.config.repository))throw Error('The update channel configuration is invalid.');
  try {
   const response=await this.fetcher(`https://api.github.com/repos/${this.config.repository}/releases?per_page=100`,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw Error('The update service is unavailable. Try again later.');
   const text=await response.text();if(text.length>2*1024*1024)throw Error('The update response is too large.');
   const result=eligibleRelease(JSON.parse(text),{...this.config,current:this.current,platform:this.platform,arch:this.arch});
   if(result.status==='available')this.available=result;
   if(manual)return result;
   if(result.status!=='available'||result.version===this.settings.value.dismissedUpdate)return null;
   await this.settings.update({dismissedUpdate:result.version});return result;
  } catch(error){if(manual)return {status:'error',message:error.message};return null;}
 }
}
module.exports={Updates,eligibleRelease,WEEK};

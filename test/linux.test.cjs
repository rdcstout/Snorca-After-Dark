const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const L=require('../linux.cjs');
test('Linux respects absolute XDG configuration and knows Flatpak profile location',()=>{
 assert.deepEqual(L.candidates('/home/test',{XDG_CONFIG_HOME:'/custom'}),['/custom/Snapmaker_Orca','/home/test/.var/app/io.github.Snapmaker.Snapmaker_Orca/config/Snapmaker_Orca']);
 assert.equal(L.candidates('/home/test',{XDG_CONFIG_HOME:'relative'})[0],'/home/test/.config/Snapmaker_Orca');
});
test('Linux process guard recognizes official process paths without matching other apps',()=>{
 for(const value of ['snapmaker-orca','/tmp/.mount_orca/bin/snapmaker-orca','/app/bin/snapmaker-orca','Snapmaker_Orca'])assert.equal(L.matchesProcess(value),true);
 for(const value of ['snorca-after-dark','orca','/usr/bin/ps','snapmaker-orca-helper'])assert.equal(L.matchesProcess(value),false);
});
test('Linux discovers initialized profiles and refuses symbolic web directories',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'snorca-linux-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const [normal,flatpak]=L.candidates(root,{});
 assert.deepEqual(await L.discover(root,{}),[]);
 for(const folder of [normal,flatpak]){
  const web=path.join(folder,'web','flutter_web');await fs.mkdir(web,{recursive:true});
  for(const f of ['version.json','main.dart.js','index.html'])await fs.writeFile(path.join(web,f),'fixture');
 }
 assert.deepEqual(await L.discover(root,{}),[normal,flatpak]);
 await fs.rename(path.join(normal,'web'),path.join(normal,'saved-web'));await fs.symlink(path.join(normal,'saved-web'),path.join(normal,'web'));
 await assert.rejects(L.webResources(normal),/configuration folder/);
});

const {test}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),vm=require('node:vm');
const E=require('../engine.cjs'),V=require('../web241.cjs');
const source=process.env.ORCA_241_FIXTURE;
test('Orca 2.4.1 apply, reapply, unknown-file rejection and exact restore',{skip:!source},async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'snorca241-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const bundle=path.join(root,'bundle'),target=path.join(root,'target'),store=path.join(root,'store');await fs.mkdir(bundle);
 const originals={};for(const f of [...V.FILES,'version.json']){await fs.mkdir(path.dirname(path.join(bundle,f)),{recursive:true});await fs.copyFile(path.join(source,f),path.join(bundle,f));originals[f]=await fs.readFile(path.join(bundle,f));}
 const a={bundle,target,store,theme:await fs.readFile(path.join(__dirname,'../theme.js'),'utf8'),check:async()=>false};
 const patched=E.patch(originals,a.theme),main=patched[V.main].toString();new vm.Script(main);
 assert.match(main,/o,n,window.__orcaDarkActive\?B.brg:B.brf,m/);
 const stamp=patched['index.html'].toString().match(/main.dart.js\?orcaDark=([a-f0-9]+)/)[1];
 assert.ok(patched['flutter_bootstrap.js'].toString().includes('main.dart.js?orcaDark='+stamp));
 const imageHook=main.match(/aml\(\)\{var s=this.bf[\s\S]*?\},/)[0].slice(0,-1);
 const render=new Function('A','B','window','return ({'+imageHook+'}).aml')({rw:function(color,mode){this.mode=mode;}},{lo:'srcIn',a4P:'exclusion'},{__orcaDarkActive:true});
 const placeholder={bf:{__snorcaPlaceholder:true}},ordinary={bf:{}};render.call(placeholder);render.call(ordinary);
 assert.equal(placeholder.aD.mode,'exclusion');assert.equal(ordinary.aD.mode,'srcIn');
 const home=main.match(/aVL\(a\)\{var s,r=this.c[\s\S]*?\},/)[0].slice(0,-1);
 for(const dark of [false,true])for(const disabled of [false,true]){
  const themeColor={vendor:true};
  const api={t:()=>({ax:{c:themeColor}}),bqj:function(owner){this.owner=owner;},J:function(...channels){this.channels=channels;},bRy:(...args)=>args,bs:()=>null,c:x=>x,at:x=>x};
  const build=new Function('A','B','t','window','return ({'+home+'}).aVL')(api,{akt:'home'}, {},{__orcaDarkActive:dark});
  const owner={c:{},aKG:()=>null},button=build.call(owner,disabled)[0];
  assert.equal(button[3],'home');assert.equal(button[0],8);assert.equal(button[2],40);assert.equal(button[4],20);assert.equal(button[6],56);
  if(dark)assert.deepEqual(button[1].channels.slice(0,4),[1,62/255,62/255,69/255]);else assert.equal(button[1],themeColor);
  if(disabled)assert.equal(button[5],null);else assert.equal(button[5].owner,owner);
 }
 for(const f of V.FILES)assert.throws(()=>E.patch({...originals,[f]:Buffer.concat([originals[f],Buffer.from('changed')])},a.theme),/not supported/);
 const before=await E.treeDigest(bundle);
 assert.equal((await E.inspect(a)).version,'1.8.5');await E.apply(a);
 assert.equal((await E.inspect(a)).current,true);assert.match((await E.apply(a)).message,/already/);assert.equal(await E.treeDigest(bundle),before);
 const p=path.join(target,V.main),bytes=await fs.readFile(p);await fs.appendFile(p,'changed');await assert.rejects(E.restore(a),/changed after applying/);await fs.writeFile(p,bytes);
 await E.restore(a);assert.equal(await E.treeDigest(target),before);
});

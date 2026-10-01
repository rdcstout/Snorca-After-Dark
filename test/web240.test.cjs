const {test}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const E=require('../engine.cjs'),V=require('../web240.cjs');
const source=process.env.ORCA_240_FIXTURE;
test('Orca 2.4.0 hashed resources apply, reapply, refuse edits and restore exactly',{skip:!source},async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'snorca240-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const bundle=path.join(root,'bundle'),target=path.join(root,'target'),store=path.join(root,'store');await fs.mkdir(bundle);
 for(const f of [...V.FILES,'version.json']){await fs.mkdir(path.dirname(path.join(bundle,f)),{recursive:true});await fs.copyFile(path.join(source,f),path.join(bundle,f));}
 const a={bundle,target,store,theme:await fs.readFile(path.join(__dirname,'../theme.js'),'utf8'),check:async()=>false};
 const originals={};for(const f of V.FILES)originals[f]=await fs.readFile(path.join(bundle,f));
 const patchedMain=V.patch(originals,a.theme,E.hash)[V.main].toString();
 // Execute the real patched renderer hook: placeholder images use exclusion,
 // while ordinary colored images retain the vendor's srcIn behavior.
 const hook=patchedMain.match(/aiG\(\)\{var s=this.aV[\s\S]*?\},\nse4/)[0].replace(/,\nse4$/, '');
 const make=new Function('A','B','window','return ({'+hook+'}).aiG');
 const render=make({k4:function(color,mode){this.mode=mode;}},{ea:'srcIn',a0W:'exclusion',eO:0},{__orcaDarkActive:true});
 const placeholder={aV:{__snorcaPlaceholder:true}},ordinary={aV:{}};
 render.call(placeholder);render.call(ordinary);
 assert.equal(placeholder.aC.mode,'exclusion');assert.equal(ordinary.aC.mode,'srcIn');
 const before=await E.treeDigest(bundle);
 assert.equal((await E.inspect(a)).version,'2.3.38');await E.apply(a);
 assert.equal((await E.inspect(a)).current,true);assert.match((await E.apply(a)).message,/already/);
 assert.equal(await E.treeDigest(bundle),before);
 const p=path.join(target,V.main),patched=await fs.readFile(p);await fs.appendFile(p,'changed');
 await assert.rejects(E.restore(a),/changed after applying/);await fs.writeFile(p,patched);
 await E.restore(a);assert.equal(await E.treeDigest(target),before);
 await fs.appendFile(p,'changed');await assert.rejects(E.apply(a),/not supported/);
});

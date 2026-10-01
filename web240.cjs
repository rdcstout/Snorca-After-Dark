'use strict';
const KNOWN={
  "index.html": "d377ed8e7d90434b32aaf0b626d077b896f252c30f22a5189c7f6105b559d236",
  "main.8c1e336f107a452a.js": "8c1e336f107a452af6133ff5a6a309efe891031afe74d3636e9cfd32244282c2",
  "flutter_bootstrap.8411d9d1e47b24e7.js": "8411d9d1e47b24e7c903068850939be15d8dbdfcf203666e500aea07a09f8d1a",
  "assets/assets/svgs/device/keyboardArrowDropDown.svg": "affc57460695dbfce0a341f819a24ddc644bddf35466fefd2fa6a94910bcf661",
  "assets/assets/svgs/device/pause.svg": "a928f3023ecc692858434247a28ad43e5bcf38f1dbe2e29b1ddaed781a95f1f7"
};
const WINDOWS_KNOWN={
  "index.html": "0d7cb7020656f2fa21382559525d60d83ddb3980f6a82c032c5ac42933ae63a5",
  "main.8c1e336f107a452a.js": "17ccfb0c7cecdd4fc146c4018b414fc6b4011a9858813aafc2e02bc48dd24dcb",
  "flutter_bootstrap.8411d9d1e47b24e7.js": "48fdf5c68295eaf0df65be4d7e912da82630a0684512f0f490549a84585c2790",
  "assets/assets/svgs/device/keyboardArrowDropDown.svg": "399efeb691563706d53d2edf14b5b6348255ac63814814d789781961b47ee5a9",
  "assets/assets/svgs/device/pause.svg": "c5401c0f93f86ee0976b92a14e74bd2897b3478bd138b6af761e6d56e89e7402"
};
const FILES=Object.keys(KNOWN);
module.exports={KNOWN,WINDOWS_KNOWN,FILES,main:FILES[1],bootstrap:FILES[2]};
// Hooks below are specific to the hash-verified 2.3.38 / 20260915154633 build.
module.exports.patch=function(original,theme,hash){
 for(const f of FILES)if(!original[f]||![KNOWN[f],WINDOWS_KNOWN[f]].includes(hash(original[f])))throw Error('This Orca web build is not supported yet (or its files were edited). Nothing changed.');
 let main=original[FILES[1]].toString().replace(/\r\n/g,'\n');
 const once=(from,to)=>{if(main.split(from).length!==2)throw Error('Orca 2.4.0 theme hook changed. Nothing changed.');main=main.replace(from,to);};
 const color=(r,g,b)=>`new A.V(1,${r}/255,${g}/255,${b}/255,B.n)`;
 const scoped=(start,end,from,to)=>{
  const a=main.indexOf(start),b=main.indexOf(end,a+start.length);
  if(a<0||b<0||!main.slice(a,b).includes(from))throw Error('Orca 2.4.0 control theme hook changed. Nothing changed.');
  main=main.slice(0,a)+main.slice(a,b).split(from).join(to)+main.slice(b);
 };
 once('case 0:q.a=q.b=!1\nA.Hx("[ThemeVM] toggleTheme, isDark: false, isSystemTheme: false")','case 0:q.a=!1;q.b=!!window.__orcaDarkActive\nA.Hx("[ThemeVM] Snorca After Dark")');
 scoped('A.agK.prototype={','A.Ta.prototype=', 's=i?B.v:B.o3',`s=window.__orcaDarkActive?(i?${color(62,62,69)}:${color(51,51,55)}):(i?B.v:B.o3)`);
 scoped('A.ME.prototype={','A.aBa.prototype=', 'A.u(a).ax.c',`(window.__orcaDarkActive?${color(62,62,69)}:A.u(a).ax.c)`);
 scoped('A.Wh.prototype={','A.bb6.prototype=', 'new A.aL(B.B1,',`new A.aL(window.__orcaDarkActive?${color(62,62,69)}:B.B1,`);
 scoped('A.bkn.prototype={','A.bkm.prototype=', 'new A.aL(B.v,q,q,n,q,q,q,B.D)',`new A.aL(window.__orcaDarkActive?${color(45,45,49)}:B.v,q,q,n,q,q,q,B.D)`);
 // Flutter 3.41 represents Color as normalized floating-point channels.
 for(const [name,old,r,g,b] of [
  ['B.ob','new A.V(1,0.09411764705882353,0.09411764705882353,0.10588235294117647,B.n)',45,45,49],
  ['B.a8a','new A.V(1,0.023529411764705882,0.023529411764705882,0.027450980392156862,B.n)',36,36,40]
 ])once(name+'='+old,name+'=(window.__orcaDarkActive?'+color(r,g,b)+':'+old+')');
 // Canvas-rendered headers and placeholders no longer expose CSS paint nodes.
 scoped('A.aj5.prototype={','A.b9K.prototype=', 'B.h1',`(window.__orcaDarkActive?${color(239,239,240)}:B.h1)`);
 scoped('A.aj5.prototype={','A.b9K.prototype=', 'new A.aL(s.x,',`new A.aL(window.__orcaDarkActive?${color(54,54,60)}:s.x,`);
 scoped('A.b9L.prototype={','A.b9J.prototype=', 'p=p?B.v:B.B',`p=p?(window.__orcaDarkActive?${color(62,62,69)}:B.v):B.B`);
 once('qG(a,b,c,d,e,f,g,h,i){var s=null\nreturn new A.tL(A.b41(s,s,new A.MI(a,b,h)),s,s,d,i,f,c,g,B.eW,s,e,B.H,B.en,!1,!1,s)}',`qG(a,b,c,d,e,f,g,h,i){var s=null,q=new A.tL(A.b41(s,s,new A.MI(a,b,h)),s,s,d,i,f,c,g,B.eW,s,e,B.H,B.en,!1,!1,s);if(window.__orcaDarkActive&&["assets/images/defaultEmpty.png","assets/images/controlDefault.png","assets/images/deviceNotConnected.webp","assets/images/printtaskDefault.png"].includes(a)){q.x=${color(219,219,219)};q.x.__snorcaPlaceholder=true}return q}`);
 once('else this.aC=new A.k4(s,B.ea,null,B.eO)', 'else this.aC=new A.k4(s,window.__orcaDarkActive&&s.__snorcaPlaceholder?B.a0W:B.ea,null,B.eO)');
 once('cd(a,b,c,d,e,f,g){return new A.ew(a,g,e,d,b,f,c,null)}',`cd(a,b,c,d,e,f,g){if(window.__orcaDarkActive&&["assets/svgs/device/liveCamera.svg","assets/svgs/device/videoCall.svg","assets/svgs/device/exclamationMark.svg","assets/svgs/device/iconFile.svg"].includes(a))b=${color(220,220,224)};return new A.ew(a,g,e,d,b,f,c,null)}`);
 const stamp=hash(theme+main).slice(0,12),out={};
 let html=original['index.html'].toString();
 if(html.split('</head>').length!==2)throw Error('HTML hook changed. Nothing changed.');
 html=html.replace('</head>','<!-- Orca Dark Launcher -->\n<script>\n'+theme+'\n</script>\n</head>');
 for(const file of [FILES[1],FILES[2]])html=html.replaceAll('"'+file+'"','"'+file+'?orcaDark='+stamp+'"');
 out['index.html']=Buffer.from(html);out[FILES[1]]=Buffer.from(main);
 const bootstrap=original[FILES[2]].toString();
 const hook='"mainJsPath":"'+FILES[1]+'"';
 if(bootstrap.split(hook).length!==2)throw Error('Bootstrap hook changed. Nothing changed.');
 out[FILES[2]]=Buffer.from(bootstrap.replace(hook,'"mainJsPath":"'+FILES[1]+'?orcaDark='+stamp+'"'));
 for(const f of FILES.slice(3)){
  const svg=original[f].toString();if(!svg.includes('fill="#333333"'))throw Error('Icon colors changed. Nothing changed.');
  out[f]=Buffer.from(svg.replaceAll('fill="#333333"','fill="#EFEFF0"'));
 }
 return out;
};

'use strict';
// Exact bundled web resources from Snapmaker Orca 2.4.1 (20261023182959).
const KNOWN={
  "index.html": "77b4d37d2fe3862a6633039e5c74aadd86dd14cd1e533e3e5c4fc94dfe2cb3b6",
  "main.dart.js": "96109093573873627edd92bc538d46eaa0f46470f337a8d1f281e0f4db07f657",
  "flutter_bootstrap.js": "dfacffc862a731af300c366d877aba2f9703f0eebbfa190ff8704b0bb0b9f9ad",
  "assets/assets/svgs/device/keyboardArrowDropDown.svg": "affc57460695dbfce0a341f819a24ddc644bddf35466fefd2fa6a94910bcf661",
  "assets/assets/svgs/device/pause.svg": "a928f3023ecc692858434247a28ad43e5bcf38f1dbe2e29b1ddaed781a95f1f7"
};
const FILES=Object.keys(KNOWN);
module.exports={KNOWN,FILES,main:FILES[1]};
module.exports.patch=function(original,theme,hash){
 for(const f of FILES)if(!original[f]||hash(original[f])!==KNOWN[f])throw Error('This Orca web build is not supported yet (or its files were edited). Nothing changed.');
 let main=original[FILES[1]].toString();
 const once=(from,to)=>{if(main.split(from).length!==2)throw Error('Orca 2.4.1 theme hook changed. Nothing changed.');main=main.replace(from,to);};
 const color=(r,g,b)=>`new A.J(1,${r}/255,${g}/255,${b}/255,B.i)`;
 const scoped=(start,end,from,to)=>{
  const a=main.indexOf(start),b=main.indexOf(end,a+start.length);
  if(a<0||b<0||!main.slice(a,b).includes(from))throw Error('Orca 2.4.1 control theme hook changed. Nothing changed.');
  main=main.slice(0,a)+main.slice(a,b).split(from).join(to)+main.slice(b);
 };
 // Keep the supplied light theme for routes outside Home and Device.
 once('return new A.JS(r,new A.b58(),o,n,B.brf,m,l,k.d,!1,p,q,null)',
      'return new A.JS(r,new A.b58(),o,n,window.__orcaDarkActive?B.brg:B.brf,m,l,k.d,!1,p,q,null)');
 scoped('A.QH.prototype={','A.aIP.prototype=', 'A.t(a).ax.c',`(window.__orcaDarkActive?${color(62,62,69)}:A.t(a).ax.c)`);
 scoped('A.a_C.prototype={','A.bkD.prototype=', 'new A.aC(B.oa,',`new A.aC(window.__orcaDarkActive?${color(62,62,69)}:B.oa,`);
 once('A.bRy(8,r.ax.c,40,B.akt,20,s,56)',`A.bRy(8,window.__orcaDarkActive?${color(62,62,69)}:r.ax.c,40,B.akt,20,s,56)`);
 scoped('A.amY.prototype={','A.Su.prototype=', 's=i?B.n:B.us',`s=window.__orcaDarkActive?(i?${color(62,62,69)}:${color(45,45,49)}):(i?B.n:B.us)`);
 scoped('A.K0.prototype={','A.b3l.prototype=', 'A.t(a).ok.Q',`(window.__orcaDarkActive?A.t(a).ok.Q.fT(${color(190,190,198)},12,B.D):A.t(a).ok.Q)`);
 scoped('A.a3m.prototype={','A.bB2.prototype=', 'A.t(a).ax.b',`(window.__orcaDarkActive?${color(128,191,255)}:A.t(a).ax.b)`);
 for(const icon of ['myDevice','recentDocuments','modelStation'])once(`new A.eF("assets/svgs/${icon}.svg",20,20,B.I,null,null,null,null,null,!1,null)`,`new A.eF("assets/svgs/${icon}.svg",20,20,B.I,window.__orcaDarkActive?${color(220,220,224)}:null,null,null,null,null,!1,null)`);
 // Match the native gray surface without changing the vendor's light palette.
 once('B.uo=new A.J(1,0.13725490196078433,0.1568627450980392,0.17647058823529413,B.i)',
 `B.uo=window.__orcaDarkActive?${color(45,45,49)}:new A.J(1,0.13725490196078433,0.1568627450980392,0.17647058823529413,B.i)`);
 // Device headers and empty-state images retain fixed light colors upstream.
 scoped('A.apd.prototype={','A.biM.prototype=', 'B.dR',`(window.__orcaDarkActive?${color(239,239,240)}:B.dR)`);
 scoped('A.apd.prototype={','A.biM.prototype=', 'new A.aC(s.x,',`new A.aC(window.__orcaDarkActive?${color(54,54,60)}:s.x,`);
 scoped('A.biN.prototype={','A.biL.prototype=', 'p=p?B.n:B.v',`p=p?(window.__orcaDarkActive?${color(62,62,69)}:B.n):B.v`);
 once('yp(a,b,c,d,e,f,g,h,i,j){var s=null\nreturn new A.v4(A.amO(c,b,new A.Hl(a,s,i)),s,s,e,j,g,d,h,B.cG,s,f,B.G,B.cH,!1,!1,s,!1,s)}',`yp(a,b,c,d,e,f,g,h,i,j){var s=null,q=new A.v4(A.amO(c,b,new A.Hl(a,s,i)),s,s,e,j,g,d,h,B.cG,s,f,B.G,B.cH,!1,!1,s,!1,s);if(window.__orcaDarkActive&&["assets/images/defaultEmpty.png","assets/images/controlDefault.png","assets/images/deviceNotConnected.webp","assets/images/printtaskDefault.png"].includes(a)){q.x=${color(210,210,206)};q.x.__snorcaPlaceholder=true}return q}`);
 once('else this.aD=new A.rw(s,B.lo,null,B.o_)','else this.aD=new A.rw(s,window.__orcaDarkActive&&s.__snorcaPlaceholder?B.a4P:B.lo,null,B.o_)');
 once('cq(a,b,c,d,e,f,g,h,i,j){return new A.eF(a,j,f,e,c,i,d,h,g,b,null)}',`cq(a,b,c,d,e,f,g,h,i,j){if(window.__orcaDarkActive&&["assets/svgs/device/liveCamera.svg","assets/svgs/device/videoCall.svg","assets/svgs/device/exclamationMark.svg","assets/svgs/device/iconFile.svg"].includes(a))c=${color(220,220,224)};return new A.eF(a,j,f,e,c,i,d,h,g,b,null)}`);
 // Raise foreground contrast within the supplied dark color scheme only.
 const darkScheme='B.am2=new A.rS(B.acc,B.o3,B.uo,B.o8,B.Cm,B.CJ,B.Cy,B.o3,B.uo,B.Cm,B.o3,B.fq,B.Cr,B.ur,B.acq,B.u,B.o3,B.o8,B.CV,B.act,B.acP,B.acb,B.dQ,B.Cg,B.Cj,B.uo,B.Cj,B.Cy,B.CW,B.du,B.C4)';
 once(darkScheme,darkScheme.replaceAll('B.o3',`(window.__orcaDarkActive?${color(239,239,240)}:B.o3)`).replaceAll('B.o8',`(window.__orcaDarkActive?${color(190,190,198)}:B.o8)`).replaceAll('B.CV',`(window.__orcaDarkActive?${color(174,174,184)}:B.CV)`));
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

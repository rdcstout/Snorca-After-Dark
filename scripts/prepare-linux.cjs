'use strict';
const fs=require('node:fs');
const file=require.resolve('app-builder-lib/out/targets/appimage/appImageUtil.js');
let text=fs.readFileSync(file,'utf8');
const marker='// Snorca: preserve Electron sandbox; never auto-disable it.';
if(!text.includes(marker)){
 const start=text.indexOf('HAVE_NO_SANDBOX=0\n');
 const end=text.indexOf('\natexit()\n',start);
 if(start<0||end<0||!text.slice(start,end).includes('NO_SANDBOX=(--no-sandbox)'))throw Error('AppImage launcher changed; review required.');
 text=text.slice(0,start)+'# '+marker+'\nNO_SANDBOX=()\n'+text.slice(end);
 fs.writeFileSync(file,text);
}
const {generateAppRunScript}=require(file);
const script=generateAppRunScript({ExecutableName:'snorca-after-dark'});
if(script.includes('--no-sandbox'))throw Error('AppImage sandbox bypass remains.');
if(require('../package.json').build.appImage.executableArgs.length)throw Error('Unexpected AppImage launch arguments.');
console.log('AppImage launcher retains the Electron sandbox.');

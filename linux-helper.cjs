'use strict';
const engine=require('./engine.cjs'),linux=require('./linux.cjs');
(async()=>{
 const q=JSON.parse(process.argv[2]);
 const allowed=new Set(['appBundle','isRunning','exists','recover','inspect','apply','restore','discover']);
 if(!allowed.has(q.method)||!Array.isArray(q.args))throw Error('Invalid patch operation.');
 const fn=q.method==='discover'?linux.discover:engine[q.method];
 if(['apply','restore'].includes(q.method))delete q.args[0].check;
 const result=await fn(...q.args);
 process.stdout.write(JSON.stringify({result}));
})().catch(error=>{process.stdout.write(JSON.stringify({error:error.message}));process.exitCode=0;});

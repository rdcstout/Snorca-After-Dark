const fs=require('node:fs'),path=require('node:path'),asar=require('@electron/asar');
const archive=process.argv[2];if(!archive)throw Error('Pass the packaged app.asar path.');
const pkg=require('../package.json'),packaged=JSON.parse(asar.extractFile(archive,'package.json'));
if(packaged.version!==pkg.version)throw Error('Packaged version mismatch.');
for(const file of ['linux.cjs','main.cjs','runtime.cjs','updates.cjs','release-channel.json','engine.cjs','theme.js','preload.cjs','ui/index.html','ui/renderer.js','ui/style.css'])if(!asar.extractFile(archive,file).equals(fs.readFileSync(path.join(__dirname,'..',file))))throw Error('Packaged source mismatch: '+file);
console.log('Packaged version and application source verified:',pkg.version);

const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
for(const folder of ['.','ui','test','scripts'])for(const name of fs.readdirSync(folder))if(/\.(cjs|js)$/.test(name))execFileSync(process.execPath,['--check',path.join(folder,name)],{stdio:'inherit'});
const pkg=require('../package.json'),lock=require('../package-lock.json');if(pkg.version!==lock.version||pkg.version!==lock.packages[''].version)throw Error('Package and lock versions disagree.');
console.log('Syntax and package versions verified.');

const licenses=require('../assets/licenses/versions.json');if(licenses.electron!==pkg.devDependencies.electron||licenses.semver!==pkg.dependencies.semver)throw Error('Refresh packaged notices for the dependency versions.');

const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const theme=fs.readFileSync(require('node:path').join(__dirname,'../theme.js'),'utf8');
const gate=theme.slice(0,theme.indexOf('  const placeholderHashes'))+'})();';
test('theme gate supports old and new Home/Device routes and excludes other pages',()=>{
 for(const [pathname,search,enabled] of [
  ['/web/flutter_web/index.html','?path=0',true],['/web/flutter_web/index.html','?path=2',true],
  ['/web/flutter_web/index.html','?path=1',false],['/web/flutter_web/home','?locale=en-US&dark_model=1',true],
  ['/web/flutter_web/device_control','?locale=en-US',true],['/web/flutter_web/home/','',true],
  ['/web/flutter_web/prepare_print','',false],['/web/flutter_web/login','',false],['/unrelated/home','',false]
 ]){const context={window:{},location:{pathname,search},URLSearchParams};vm.runInNewContext(gate,context);assert.equal(!!context.window.__orcaDarkActive,enabled,pathname+search);}
});

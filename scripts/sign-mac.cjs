'use strict';
const {signAsync}=require('@electron/osx-sign');
// The login keychain contains two valid certificates with the same common name.
// Pass the verified fingerprint through to codesign so it selects exactly one.
module.exports=async function sign(options,packager){
 const identity=packager.platformSpecificBuildOptions.identity;
 if(!/^[A-F0-9]{40}$/i.test(identity))throw Error('Configure the Developer ID certificate fingerprint before signing.');
 await signAsync({...options,identity,identityValidation:false});
};

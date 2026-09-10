// Keep the upstream installer pinned; change only its misleading upgrade error.
const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..');
const vendor=path.join(root,'node_modules/app-builder-lib/templates/nsis');
function replaceOnce(text,from,to){if(text.includes(to)&&!text.includes(from))return text;if(text.split(from).length!==2)throw Error('Installer template changed; review required');return text.replace(from,to);}
let util=fs.readFileSync(path.join(vendor,'include/installUtil.nsh'),'utf8');
util=replaceOnce(util,'MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "$(appCannotBeClosed)" /SD IDCANCEL IDRETRY OneMoreAttempt','MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "The previous version could not be uninstalled (exit code $R0). This does not mean Snorca After Dark is running. Click Cancel to stop Setup, or Retry to try uninstalling again." /SD IDCANCEL IDRETRY OneMoreAttempt');
// Use this build's removal code for the same registered product. Older uninstallers
// retain their defective process detection even when a new installer is fixed.
util=replaceOnce(util,'!insertmacro copyFile "$uninstallerFileName" "$uninstallerFileNameTemp"','File /oname=$PLUGINSDIR\\old-uninstaller.exe "${UNINSTALLER_OUT_FILE}"');
fs.writeFileSync(path.join(vendor,'include/installUtil.nsh'),util);

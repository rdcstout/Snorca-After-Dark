const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('launcher',{
 diagnostics:()=>ipcRenderer.invoke('diagnostics'),state:()=>ipcRenderer.invoke('state'),choose:()=>ipcRenderer.invoke('choose'),action:a=>ipcRenderer.invoke('action',a),autoOpen:v=>ipcRenderer.invoke('autoOpen',v),
 onNotice:callback=>ipcRenderer.on('notice',(_event,message)=>callback(message))
});

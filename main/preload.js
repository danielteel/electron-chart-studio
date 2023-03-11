const {contextBridge, ipcRenderer}=require('electron');
const fs=require('fs/promises');
const crypto = require('crypto');

contextBridge.exposeInMainWorld('api', {
    dialog:{
        showOpenDialogModal: (options) => ipcRenderer.invoke('dialog:showOpenDialogModal', options),
        showSaveDialogModalSync: (options) => ipcRenderer.invoke('dialog:showSaveDialogModalSync', options)
    },
    fs:{
        open: (file, flags) => ipcRenderer.invoke('fs:open', file, flags),
        close: (fileHandle) => ipcRenderer.invoke('fs:close', fileHandle),
        //readFile: (file, options) => ipcRenderer.invoke('fs:readFile', file, options)
        readFile: fs.readFile
    },
    crypto:{
        hashFromBuffer: (buffer)=>{
            return crypto.createHash('sha256').update(buffer).digest('hex');
        }
    }
});
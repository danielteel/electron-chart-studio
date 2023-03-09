const {contextBridge, ipcRenderer}=require('electron');
const fs  = require('fs/promises');

contextBridge.exposeInMainWorld('api', {
    dialog:{
        showOpenDialogModal: (options) => ipcRenderer.invoke('dialog:showOpenDialogModal', options),
        showSaveDialogModalSync: (options) => ipcRenderer.invoke('dialog:showSaveDialogModalSync', options)
    },
    fs:{
        open: (file, flags) => ipcRenderer.invoke('fs:open', file, flags),
        close: (fileHandle) => ipcRenderer.invoke('fs:close', fileHandle),
        readFile: (file, options) => ipcRenderer.invoke('fs:readFile', file, options)
    }
});
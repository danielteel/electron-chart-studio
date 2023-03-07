const {contextBridge, ipcRenderer, Menu, dialog}=require('electron');
const fs  = require('fs/promises');

contextBridge.exposeInMainWorld('api', {
    dialog:{
        showOpenDialogModal: (options) => ipcRenderer.invoke('dialog:showOpenDialogModal', options),
        showSaveDialogModal: (options) => ipcRenderer.invoke('dialog:showSaveDialogModal', options)
    },
    fs:{
        open: (file, flags) => ipcRenderer.invoke('fs:open', file, flags),
        close: (fileHandle) => ipcRenderer.invoke('fs:close', fileHandle),
        readFileSync: (file, encoding=null) => ipcRenderer.invoke('fs:readFileSync', file, encoding)
    },
    readFile: fs.readFile
});
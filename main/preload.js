const {contextBridge, ipcRenderer}=require('electron');
const fs=require('fs/promises');

contextBridge.exposeInMainWorld('api', {
    dialog:{
        showOpenDialogModal: (options) => ipcRenderer.invoke('dialog:showOpenDialogModal', options),
        showSaveDialogModal: (options) => ipcRenderer.invoke('dialog:showSaveDialogModal', options)
    },
    fs:{
        readFile: (file, options) => ipcRenderer.invoke('fs:readFile', file, options),
        readFileJSON: (file) => ipcRenderer.invoke('fs:readFileJSON', file),
        writeFile: (file, data, options) => ipcRenderer.invoke('fs:writeFile', file, data, options),
        writeFileJSON: (file, object) => ipcRenderer.invoke('fs:writeFileJSON', file, object)
    },
    buffer:{
        fromArrayBuffertoBase64: (arrayBuffer) => ipcRenderer.invoke('buffer:fromArrayBuffertoBase64', arrayBuffer),
        fromBase64ToArrayBuffer: (base64) => ipcRenderer.invoke('buffer:fromBase64ToArrayBuffer', base64)
    },
    crypto:{
        hashFromBuffer: (buffer) => ipcRenderer.invoke('crypto:hashFromBuffer', buffer)
    }
});
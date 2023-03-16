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
        writeFileJSON: (file, object) => ipcRenderer.invoke('fs:writeFileJSON', file, object),
        loadImage: (file) => loadImage(file)
    },
    buffer:{
        fromArrayBuffertoBase64: (arrayBuffer) => ipcRenderer.invoke('buffer:fromArrayBuffertoBase64', arrayBuffer),
        fromBase64ToArrayBuffer: (base64) => ipcRenderer.invoke('buffer:fromBase64ToArrayBuffer', base64)
    },
    crypto:{
        hashFromBuffer: (buffer) => ipcRenderer.invoke('crypto:hashFromBuffer', buffer)
    }
});


function fileName(path) {
    const start=Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'))+1;
    return path.substr(start, path.lastIndexOf('.')-start);
}

async function loadImage(filePath){
    let imageUrl = null;

    const cleanup = () => {
        try {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
            imageUrl = null;
        }catch (e){
            console.error('loadImage -> cleanup', e);
        }
    }

    try {
        const name=fileName(filePath);
        const imageData = await ipcRenderer.invoke('fs:readFile', filePath);
        const hash = await ipcRenderer.invoke('crypto:hashFromBuffer', imageData);
        const blob = new Blob([imageData]);
        imageUrl = URL.createObjectURL(blob);
        const image = new Image();

        const imageLoadedPromise = new Promise((resolve, reject) => {
            image.onload=()=>{
                image.onload=undefined;
                image.onerror=undefined;
                resolve({image, hash, name, cleanup});
            }
            image.onerror=()=>{
                image.onload=undefined;
                image.onerror=undefined;
                cleanup();
                reject();
            }
            image.src = imageUrl;
        });

        return await imageLoadedPromise;
    } catch (e) {
        console.error('failed to loadImage');
        cleanup();
        throw e;
    }
}
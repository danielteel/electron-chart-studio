const { ipcMain, dialog, BrowserWindow } = require('electron');
const fs  = require('fs/promises');
const fsSync = require('fs');

function getBrowser(event){
    return BrowserWindow.fromWebContents(event.sender);
}


//Dialog
//https://www.electronjs.org/docs/latest/api/dialog

ipcMain.handle('dialog:showOpenDialogModal', async (event, options)=>{
    try {
        return dialog.showOpenDialogSync(getBrowser(event), options)
    }catch (e){
        console.error('error in dialog:showOpenDialogModal', e);
        return undefined;
    }
});

ipcMain.handle('dialog:showSaveDialogModal', async (event, options)=>{
    try {
        return dialog.showSaveDialogSync(getBrowser(event),options)
    }catch (e){
        console.error('error in dialog:showSaveDialogModal', e);
        return undefined;
    }
});

//File System
//https://nodejs.org/api/fs.html

const openFiles = new Map();
let openFilesCount = 0;

ipcMain.handle('fs:readFileSync', async (event, file, encoding=null)=>{
    try {
        const data = fsSync.readFileSync(file, encoding);
        console.log(data.length);
        return data;
    } catch (e) {
        return undefined;
    }
})

ipcMain.handle('fs:open', async (event, file, flags) => {
    try {
        const newFileHandle = await fs.open(file, flags);
        openFilesCount++;
        openFiles.set(openFilesCount, newFileHandle);
        return openFilesCount;
    } catch (e) { 
        console.error('error in fs:open',e);
        return undefined;
    }
});

ipcMain.handle('fs:close', async (event, fileHandle) => {
    try {
        if (openFiles.has(fileHandle)){
            await openFiles.get(fileHandle).close();
            return true;
        }
        return undefined;
    } catch (e) {
        console.error('error in fs:close',e);
        return undefined;
    }
});
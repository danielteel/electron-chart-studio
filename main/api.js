const { ipcMain, dialog, BrowserWindow } = require('electron');
const fs  = require('fs/promises');
const crypto = require('crypto');
const bfj = require('bfj');

function getBrowser(event){
    return BrowserWindow.fromWebContents(event.sender);
}


//Dialog
//https://www.electronjs.org/docs/latest/api/dialog

ipcMain.handle('dialog:showOpenDialogModal', async (event, options)=>{
    try {
        return dialog.showOpenDialog(getBrowser(event), options)
    }catch (e){
        console.error('error in dialog:showOpenDialogModal', e);
        return undefined;
    }
});

ipcMain.handle('dialog:showSaveDialogModal', async (event, options)=>{
    try {
        return dialog.showSaveDialog(getBrowser(event),options)
    }catch (e){
        console.error('error in dialog:showSaveDialogModal', e);
        return undefined;
    }
});

//File System
//https://nodejs.org/api/fs.html

ipcMain.handle('fs:writeFileJSON', async (event, file, object) => {
    try {
        await bfj.write(file, object, {yieldRate: 1638400})
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
});

ipcMain.handle('fs:readFileJSON', async (event, file) => {
    try {
        return await bfj.read(file, {yieldRate: 1638400});
    } catch (e) {
        console.error(e);
    }
});

ipcMain.handle('fs:writeFile', async (event, file, data, options) => {
    try {
        await fs.writeFile(file, data, options)
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
});

ipcMain.handle('fs:readFile', async (event, file, options)=>{
    try {
        return await fs.readFile(file, options);
    }catch (e){
        console.error(e);
    }
});


//Buffer
ipcMain.handle('buffer:fromArrayBuffertoBase64', async (event, arrayBuffer) => {
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
});

ipcMain.handle('buffer:fromBase64ToArrayBuffer', async (event, base64) => {
    const buffer = Buffer.from(base64, 'base64');
    return buffer;
});

//Crypto
ipcMain.handle('crypto:hashFromBuffer', async (event, buffer) => {
    return crypto.createHash('sha256').update(buffer).digest('hex');
});

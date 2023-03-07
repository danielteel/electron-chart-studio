const {app, BrowserWindow, ipcMain} = require('electron');
const fs  = require('fs/promises');
const path = require('path');


app.whenReady().then( () => {
    require('./api.js');

    ChartStudioWindow.NewWindow();
})



class ChartStudioWindow extends BrowserWindow{
    static NewWindow(){
        let x,y;

        const currentWindow = ChartStudioWindow.getFocusedWindow();
        if (currentWindow){
            [x,y] = currentWindow.getPosition();
            x+=10;
            y+=10;
        }

        let newWindow = new ChartStudioWindow({
            center: true,
            titleBarOverlay: true,
            webPreferences:{
                nodeIntegration: true,
                preload: path.join(__dirname,'preload.js')
            },
            show: false,
            x, 
            y
        });

        return newWindow;
    }

    constructor(...args){
        super(...args);
       
        this.loadURL('file://'+path.join(__dirname, './src/index.html'));
        this.once('ready-to-show', () => {
            this.setTitleBarOverlay({color:'#666666'});
            this.show();
        });
    }
}
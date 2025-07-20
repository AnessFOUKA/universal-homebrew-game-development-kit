const {app,BrowserWindow,Menu}=require('electron');
const path = require('path');

(async ()=>{
    Menu.setApplicationMenu(null)
    await app.whenReady();
    const win=new BrowserWindow({width:960,height:544,webPreferences:{nodeIntegration:true,contextIsolation:false}})

    win.loadURL("http://localhost:5173");
    win.on('closed',()=>{app.quit()})
    win.openDevTools()
})()
const { app, ipcMain, shell } = require('electron');
const path = require('path');

const BrowserWindow = (() => {
    if(process.platform == 'win32'){
        return require('electron-acrylic-window').BrowserWindow;
    }
    return require('electron').BrowserWindow;
})();

const LocalDB = require('../LocalDatabase');

module.exports = class Setuper {
    static hookNewWindow(webContents) {
        webContents.setWindowOpenHandler(({ url }) => {
            if (url === 'about:blank') {
                console.log('strange url: ' + url);
                return { action: 'deny' };
            }
            console.log('blocked url: ' + url);
            shell.openExternal(url);
            return { action: 'deny' };
        })
    }

    static create() {
        const params = {
            show: false,
            width: 1280,
            height: 720,
            icon: path.join(__dirname, '../icons/ftp.png'),
            webPreferences: {
                //devTools: false,
                preload: path.join(__dirname, '../frontend/js/.preload.js')
            },
            frame: false,
            vibrancy: 'window',
            title: 'Modern File Transfer',
            darkTheme: true,
        };
        if(process.platform == 'win32'){
            params.vibrancy = {
                effect: 'acrylic',
                maximumRefreshRate: 30,
                disableOnBlur: false,
                useCustomWindowRefreshMethod: false,
            }
        }
    
        let win = new BrowserWindow(params);
    
        this.checkTranslations(win);
        
        ipcMain.on('navbarEvent', (ev, code) => {
            if(ev.sender != win.webContents) return;
            if (code == 1) win.minimize();
            else if (code == 2) {
                if (win.isMaximized()) win.unmaximize();
                else win.maximize();
            }
            else if (code == 3) win.hide();
        });
    
        ipcMain.on('closeKidWindow', (ev) => {
            const kid = BrowserWindow.fromWebContents(ev.sender);
            if(!kid) return;
            kid.close();
        })
    
        return win;
    }

    static createKid(parent, width, height) {
        const params = {
            modal: true,
            parent: parent,
            width: width,
            height: height,
            resizable: false,
            icon: path.join(__dirname, '../icons/ftp.png'),
            webPreferences: {
                //devTools: false,
                preload: path.join(__dirname, '../frontend/modals/scripts/preload.js')
            },
            frame: false,
            vibrancy: 'window',
            title: 'Modern File Transfer',
            darkTheme: true,
        };
        if(process.platform == 'win32'){
            params.vibrancy = {
                effect: 'acrylic',
                maximumRefreshRate: 30,
                disableOnBlur: false,
                useCustomWindowRefreshMethod: false,
            }
        }
    
        let win = new BrowserWindow(params);
    
        this.checkTranslations(win);
    
        return win;
    }

    static checkTranslations(win) {
        win.send('translations', require('../config').translations);
        const doc = LocalDB.Database.getDocumentById('main', 'settings');
        win.send('translations.language', doc.json['language'] ?? 'en');
    }
};
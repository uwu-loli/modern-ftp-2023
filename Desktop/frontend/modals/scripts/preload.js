const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', { ...ipcRenderer,
    on: (name, event) => ipcRenderer.on(name, event),
    once: (name, event) => ipcRenderer.once(name, event),
    send: (name, ...args) => ipcRenderer.send(name, ...args),
});

window.addEventListener('keydown', (e) => {
    if(e.code == 'F11'){
        e.preventDefault();
        return;
    }
    if(e.ctrlKey && e.code == 'KeyR'){
        e.preventDefault();
        return;
    }
});

let translations = {};
let lang = 'en';
ipcRenderer.on('translations', (_, data) => translations = data);
ipcRenderer.on('translations.language', (_, data) => lang = data);
contextBridge.exposeInMainWorld('getTranslations', () => {return translations[lang]});
contextBridge.exposeInMainWorld('getAllTranslations', () => {return translations});
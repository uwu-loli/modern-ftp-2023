const connects = {received: false, data: []};

ipcRenderer.on('get.connects', (_, data) => {
    connects.data.push(...data);
    try{connects.data = connects.data.sort((a, b) => a.json.index - b.json.index);}catch{}
    connects.received = true;
});
ipcRenderer.send('get.connects');

let downloadsPath = '';
(() => {
ipcRenderer.once('get.path.downloads', (ev, path) => downloadsPath = path.replace(/[\\]/g, '/'));
ipcRenderer.send('get.path.downloads');
})();
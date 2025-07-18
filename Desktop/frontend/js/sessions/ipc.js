ipcRenderer.on('session.get.local.dir', (_, id, dir, files) => {
    const session = activeSessions.find(x => x.id == id);
    if(!session) return;
    session.events.onLocalDir(dir, files);
});

ipcRenderer.on('session.get.remote.dir', (_, id, dir, files) => {
    const session = activeSessions.find(x => x.id == id);
    if(!session) return;
    session.events.onRemoteDir(dir, files);
});

ipcRenderer.on('session.events.log', (_, id, log) => {
    const session = activeSessions.find(x => x.id == id);
    if(!session) return;
    session.events.onLog(log);
});
ipcRenderer.on('info.connected', (_, id, value) => {
    const session = activeSessions.find(x => x.id == id);
    if(!session) return;
    session.events.onConnected(value);
});

//#region stats
ipcRenderer.on('session.stats.disk', (_, id, stat, space) => {
    const session = activeSessions.find(x => x.id == id);
    if(!session) return;
    session.events.stats.onDisk(stat, space);
});
ipcRenderer.on('session.stats.mem', (_, id, stat) => {
    const session = activeSessions.find(x => x.id == id);
    if(!session) return;
    session.events.stats.onRam(stat);
});
ipcRenderer.on('session.stats.cpu', (_, id, stat) => {
    const session = activeSessions.find(x => x.id == id);
    if(!session) return;
    session.events.stats.onCPU(stat);
});
//#endregion
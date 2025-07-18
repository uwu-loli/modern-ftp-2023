const { app, BrowserWindow, globalShortcut, session } = require('electron');
const { Client } = require('qurre-socket');

const LocalDB = require('./LocalDatabase');

const Setuper = require('./modules/Setuper');
const NManager = require('./modules/notify');
const startupMenu = require('./modules/TrayMenu');
const tpu = require('./modules/TCPPortUsing');
const server = require('./modules/server');
const ipc = require('./modules/ipc');

const dev = false;
const AppPort = dev ? 1337 : 45632;

app.whenReady().then(() => {
    startup();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            startup();
        }
    })
});

app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('web-contents-created', function (ev, contents) {
    try { console.log('window created: ' + contents.getType()); } catch { }
    Setuper.hookNewWindow(contents);
});


async function startup() {
    const _portUse = await PortUsing();
    if (_portUse) {
        return;
    }

    NManager.init(1);

    const win = Setuper.create();

    win.once('ready-to-show', () => {
        win.show();
    });
    win.on('close', (e) => {
        e.preventDefault();
        win?.hide();
    });

    try { LocalDB.Database.init(); } catch (e) { console.log(e) }

    startupMenu(win);

    server(AppPort, win);
    ipc(win, NManager);

    //await win.loadFile(__dirname + '/frontend/elements/init.html');

    await win.loadFile(__dirname + '/frontend/elements/main.html');
}

async function PortUsing() {
    const _portUse = await tpu(AppPort, '127.0.0.1');
    if (_portUse) {
        try {
            setTimeout(() => app.quit(), 1000);
            const _client = new Client(AppPort);
            _client.emit('OpenApp');
        } catch { }
    }
    return _portUse;
}
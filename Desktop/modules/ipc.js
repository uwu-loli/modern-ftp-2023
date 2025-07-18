const { app, BrowserWindow, ipcMain, nativeImage, shell } = require('electron');
const { Notify, NotifySound } = require('notify-manager-electron');
const fs = require('original-fs');
const path = require('path');
const openWith = require('open-with');

const LocalDB = require('../LocalDatabase');
const { execSync } = require('child_process');
const MFClient = require('../MFClient/Client');
const Extensions = require('./Extensions');

const appDataPath = path.join(app.getPath('appData'), 'ModernFileTransfer');
const tempPath = path.join(app.getPath('temp'), 'ModernFileTransfer');
const certificatesDir = path.join(appDataPath, 'Certificates');

module.exports = (win, NManager) => {
    ipcMain.on('send.notify', async (_, title, message, time, image, sound, soundVolume) => {
        if (typeof (sound) == 'string') {
            sound = new NotifySound(path.join(__dirname, '../sounds/notify', sound + '.mp3'), soundVolume ?? 50);
        }

        const notify1 = new Notify(title, message, time, image, sound);
        NManager.getManager().show(notify1);
    });


    ipcMain.on('get.connects', () => {
        const docs = LocalDB.Database.getAllDocuments('connections');
        const _arr = [];

        for (let i = 0; i < docs.length; i++) {
            const doc = docs[i];
            _arr.push({
                id: doc.id,
                json: {
                    index: doc.json.index ?? 0,
                    name: doc.json.name ?? 'New connection',
                    user: doc.json.user ?? 'root',
                    host: doc.json.host ?? '0.0.0.0',
                    port: doc.json.port ?? 22,
                    password: !(!doc.json.password)
                }
            })
        }

        win.send('get.connects', _arr);
        _arr.length = 0;
    });

    ipcMain.on('connect.delete', (ev, id) => {
        LocalDB.Database.removeDocumentById('connections', id);
    });

    ipcMain.on('connect.update.password', (ev, id, pass) => {
        const doc = LocalDB.Database.getDocumentById('connections', id);

        if (!doc.json['host']) {
            return;
        }

        doc.json.password = pass;
        doc.save();
    });

    ipcMain.on('connect.update.data', (ev, id, name, user, host, port) => {
        const doc = LocalDB.Database.getDocumentById('connections', id);

        if (typeof (name) == 'string' && name.length > 0) {
            doc.json.name = name;
        }

        doc.json.user = user;
        doc.json.host = host;
        doc.json.port = parseInt(port);
        if (!doc.json['password']) {
            doc.json.password = '';
        }
        doc.save();
    });

    ipcMain.on('connect.create', (ev, id, index, name, user, host, port) => {
        const doc = new LocalDB.Document('connections', id, {
            index, name, user, host, port: parseInt(port), password: ''
        });
        doc.save();
    });


    ipcMain.on('session.close', (ev, id) => {
        const client = MFClient.getAll().find(x => x.id == id);

        if (!client) {
            return;
        }

        client.destroy();
    });

    ipcMain.on('session.create', (ev, id, connect) => {
        const doc = LocalDB.Database.getDocumentById('connections', connect);

        if (typeof (doc.json.password) != 'string' || doc.json.password.length < 1) {
            win.send('session.events.log', id, 'Password not found');
            return;
        }

        new MFClient(win, id, doc.json.host, parseInt(doc.json.port), doc.json.user, doc.json.password, connect);
    });


    //#region modals
    ipcMain.on('file.exist.upload', (ev, clientId, from, to, name, isUpload) => {
        if (clientId == '') {
            return;
        }

        const client = MFClient.getAll().find(x => x.id == clientId);
        if (!client) {
            return;
        }

        if (isUpload) {
            client.send('file-upload', { dir: to, path: from, name });
        } else {
            // to do;
        }

        const kid = BrowserWindow.fromWebContents(ev.sender);
        if (kid) {
            kid.close();
        }
    });

    ipcMain.on('delete.crt', (ev, id, clientId) => {
        if (id == '') {
            return;
        }

        const crtPath = path.join(certificatesDir, id);
        if (fs.existsSync(crtPath)) {
            fs.rmSync(crtPath, { recursive: true });
        }

        const kid = BrowserWindow.fromWebContents(ev.sender);
        if (kid) {
            kid.close();
        }

        const client = MFClient.getAll().find(x => x.id == clientId);
        if (client) {
            client.destroy();
        }

        const doc = LocalDB.Database.getDocumentById('connections', client.connect);
        if (!doc.json.password || doc.json.password.length < 1) {
            win.send('session.events.log', id, 'Password not found');
            return;
        }

        new MFClient(client.win, client.id, client.host, parseInt(client.port), client.user, doc.json.password, client.connect);
    });
    //#endregion


    //#region global
    ipcMain.on('session.get.file.icon.static', async (ev, id, type, onlyCustom = false) => {
        try {
            const _path = path.join(__dirname, '..', 'frontend', 'icons', type + '.png');
            if (fs.existsSync(_path)) {
                ev.reply('session.get.file.icon.static.' + id, 'file:///' + _path.replaceAll('\\', '/'));
                return;
            }
        } catch { }

        if (onlyCustom) {
            ev.reply('session.get.file.icon.static.' + id, null);
            return;
        }

        if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath, { recursive: true });

        const tempFile = path.join(tempPath, Extensions.guid(10) + '.' + type);
        fs.writeFileSync(tempFile, '');

        const img = await app.getFileIcon(tempFile);
        fs.unlinkSync(tempFile);
        const icon = img.toDataURL();

        ev.reply('session.get.file.icon.static.' + id, icon);
    });
    //#endregion


    //#region local files
    ipcMain.on('get.path.downloads', () => {
        win.send('get.path.downloads', app.getPath('downloads'));
    });

    ipcMain.on('session.open.file', (ev, dir, file) => {
        shell.beep();
        const res = openWith.open(path.join(dir, file));
        if (!res && process.platform != 'win32') {
            shell.openPath(path.join(dir, file));
        }
    });

    ipcMain.on('session.get.file.icon', async (ev, id, dir, file) => {
        const filePath = path.join(dir, file.name);
        if (!fs.existsSync(filePath)) {
            return;
        }

        let icon;

        try {
            const img = await nativeImage.createThumbnailFromPath(filePath, { width: 32, height: 32 })
            icon = img.toDataURL();
        } catch { }

        try {
            if (!icon) {
                const type = (file.isDir ? 'folder' : (file.name.split('.').slice(-1).join('.')));
                const _path = path.join(__dirname, '..', 'frontend', 'icons', type + '.png');
                if (fs.existsSync(_path)) {
                    icon = 'file:///' + _path.replaceAll('\\', '/');
                }
            }
        } catch { }

        try {
            if (!icon) {
                const img = await app.getFileIcon(filePath);
                icon = img.toDataURL();
            }
        } catch { }

        win.send('session.get.file.icon.' + id, icon);
    });

    ipcMain.on('session.set.local.dir', async (ev, id, dir) => {
        if (!fs.existsSync(dir)) {
            return;
        }
        if (dir.replace(/[\\|/]/g, '') == '..') {
            return;
        }

        if (dir.substring(1).replace('\\', '/') == ':/..') {
            const res = execSync('wmic logicaldisk get name').toString().split('\n')
                .filter(x => x.trim().length > 0 && !x.startsWith('Name'));

            const fileArr = [];
            for (let i = 0; i < res.length; i++) {
                const disk = res[i].split(':')[0] + ':/';
                const stats = fs.statSync(disk);
                const statfs = fs.statfsSync(disk);
                const json = {
                    name: disk,
                    size: !statfs ? 0 : ((statfs.blocks - statfs.bfree) * statfs.bsize),
                    change: parseInt(!stats ? 0 : stats.mtimeMs),
                    directory: true,
                }
                fileArr.push(json);
            }

            win.send('session.get.local.dir', id, '', fileArr);
            return;
        }

        /*
        {
            icon: string,
            name: string,
            size: number,
            change: number,
            directory: boolean,
        }
        */
        const fileArr = [];
        const files = fs.readdirSync(dir);

        for (let i = 0; i < files.length; i++) {
            try {
                const file = files[i];
                const filePath = path.join(dir, file);
                const stats = fs.statSync(filePath);
                if (stats.isFile() || stats.isDirectory()) {
                    if (stats.isDirectory()) {
                        try {
                            const _err = await new Promise(res => fs.open(filePath, 'r', (err, fd) => {
                                if (fd) fs.close(fd);
                                res(err);
                            }));
                            if (_err) continue;
                        } catch { }
                    }
                    const json = {
                        name: file,
                        size: !stats ? 0 : stats.size,
                        change: parseInt(!stats ? 0 : stats.mtimeMs),
                        directory: !stats ? false : stats.isDirectory(),
                    }
                    fileArr.push(json);
                }
            } catch { }
        }

        win.send('session.get.local.dir', id, path.join(dir).replaceAll('\\', '/'), fileArr);
    });
    //#endregion


    //#region remote files
    ipcMain.on('session.set.remote.dir', (ev, id, dir) => {
        const client = MFClient.getAll().find(x => x.id == id);
        if (!client) {
            return;
        }

        client.send('set-working-dir', path.normalize(dir).replace(/\\/g, '/'));
    });

    ipcMain.on('session.edit.remote.file', (ev, id, dir, file) => {
        // to do
    });

    ipcMain.on('session.file.upload', (ev, id, dir, file, name) => {
        const client = MFClient.getAll().find(x => x.id == id);
        if (!client) {
            return;
        }

        client.send('path-exist', { path: path.join(dir, name).replaceAll('\\', '/'), dir, sourcePath: file, name });
    });
    //#endregion
};
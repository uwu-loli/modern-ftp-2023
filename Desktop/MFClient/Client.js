const fs = require('original-fs');
const cp = require('child_process');
const path = require('path');

const _path = path.join(__dirname, '../../Client-SFTP-CS/Build/Release/net6.0/MFClientSFTP.exe');
//const _path = path.join(__dirname, '../../Client-SFTP/target/release/client_sftp.exe');
let clients = [];

let events = (() => {
    const _arr = [];

    try{
        const _dir = path.join(__dirname, 'Events');
        const files = fs.readdirSync(_dir);
    
        for (let i = 0; i < files.length; i++) {
            try{
                const file = files[i];
                const _ev = require(path.join(_dir, file));
                if(typeof _ev.onCall == 'function'){
                    const _fileArr = file.split('.');
                    _fileArr.splice(-1);
                    _arr.push({name: _fileArr.join('.'), ev: _ev.onCall});
                }
            }catch{}
        }
    }catch(e){
        console.error(e);
    }

    return _arr;
})();

module.exports = class MFClient {
    static getAll() {
        return clients;
    }

    constructor(win, id, host, port, user, password, connect){
        this.win = win;
        this.id = id;
        
        this.host = host;
        this.port = port;
        this.user = user;
        this.connect = connect;

        clients.push(this);

        if(!fs.existsSync(_path)) return console.error('MFTClient not found.');

        let _init = false;

        this.process = cp.spawn(_path);
        
        let _cached = '';
        this.process.stdout.setEncoding('utf8');
        this.process.on('close', () => {
            win.send('info.connected', id, false);
            win.send('session.events.log', id, 'MFTClient crashed..');
        })
        this.process.stdout.on('data', (data) => {
            if(!_init){
                if(data.trim() == 'Ready'){
                    _init = true;
                    this.send('connect', {host, port, user, password});
                    password = null;
                }
                return;
            }
            const _arr = data.split('\n');
            for (let i = 0; i < _arr.length; i++) {
                const _data = _arr[i].trim();
                if(_data.length == 0) continue;
                try{
                    const json = JSON.parse(_data.trim());
                    const _ev = events.find(x => x.name == json.event);
                    if(_ev) _ev.ev(this, json.args);
                    _cached = '';
                }catch(e){
                    _cached += _data;
                    try{
                        const json = JSON.parse(_cached.trim());
                        const _ev = events.find(x => x.name == json.event);
                        if(_ev) _ev.ev(this, json.args);
                        _cached = '';
                        return;
                    }catch{}

                    if(_data.length < 8000){
                        console.log(e)
                        console.log(_data);
                        console.log('-------------');
                    }
                }
            }
        });
    }

    send(event, args) {
        if(this.socket) this.socket.write(JSON.stringify({event, args}) + '\n');
        if(!this.process.stdin.writable){
            console.error('[MFTClient] Process is not writable');
            return;
        }
        console.log(JSON.stringify({event, args}))
        this.process.stdin.write(JSON.stringify({event, args}) + '\n');
    }

    destroy() {
        this.process.kill();
        const index = clients.indexOf(this);
        if(index > -1){
            clients.splice(index, 1);
        }
    }
}
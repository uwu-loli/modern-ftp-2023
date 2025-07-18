const Setuper = require('../../modules/Setuper');
const Extensions = require('../../modules/Extensions');

const fs = require('original-fs');

module.exports = class Event {
    static async onCall(client, value) {
        if(!value) return;
        if(!value.exist){
            client.send('file-upload', {dir: value.dir, path: value.sourcePath, name: value.name});
            return;
        }

        const kid = Setuper.createKid(client.win, 500, 350)
        await kid.loadFile(__dirname + '/../../frontend/modals/elements/file.exist.html');

        let isDir = false;
        try{isDir = fs.lstatSync(value.sourcePath).isDirectory();}catch{}
        kid.send('file.exist.info', client.id, `${client.user}@${client.host}:${client.port}`, true, value.sourcePath, value.dir, value.name, isDir);
    }
}
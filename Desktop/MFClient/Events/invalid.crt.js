const Setuper = require('../../modules/Setuper');
const Extensions = require('../../modules/Extensions');

module.exports = class Event {
    static async onCall(client, value) {
        const kid = Setuper.createKid(client.win, 340, 380)
        await kid.loadFile(__dirname + '/../../frontend/modals/elements/invalid.crt.html');
        kid.send('crt.info', client.id, client.user, 
        `${client.host}:${client.port}`, 
        Extensions.sha256(`${client.user}@${client.host}:${client.port}`),
        value.key_type, value.hash);
    }
}
module.exports = class Event {
    static onCall(client, data) {
        client.win.send('session.get.remote.dir', client.id, data.dir, data.files);
    }
}
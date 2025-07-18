module.exports = class Event {
    static onCall(client, data) {
        client.win.send('info.connected', client.id, data);
    }
}
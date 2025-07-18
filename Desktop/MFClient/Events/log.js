module.exports = class Event {
    static onCall(client, text) {
        client.win.send('session.events.log', client.id, text);
    }
}
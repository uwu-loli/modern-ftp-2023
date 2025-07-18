module.exports = class Event {
    static onCall(client, data) {
        const _data = data.trim().split(' ');
        client.win.send('session.stats.cpu', client.id, (100 - parseInt(_data[14])));
    }
}
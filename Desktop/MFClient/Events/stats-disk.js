module.exports = class Event {
    static onCall(client, data) {
        const _data = data.split(' ');
        const used = parseInt(_data[3]) * 1024;
        const available = parseInt(_data[4]) * 1024;
        const use = parseInt(100.0 * (used / (used + available)));
        client.win.send('session.stats.disk', client.id, use, used);
    }
}
const { app, ipcMain } = require('electron');
const { Server, Client } = require('qurre-socket');

module.exports = (port, win) => {
    const server = new Server(port);
    server.on('connection', (socket) => {
        socket.on('OpenApp', () => win.show());

        socket.on('log', ([log]) => console.log(log));
    });
    server.initialize();
};
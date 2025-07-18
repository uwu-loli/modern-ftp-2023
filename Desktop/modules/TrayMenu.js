const electron = require('electron');

module.exports = (win) => {
    const tray = new electron.Tray(__dirname + '/../icons/icon.png')
    tray.setToolTip('Modern File Transfer');
    tray.setIgnoreDoubleClickEvents(true);
    tray.on('click', () => win.show());
};
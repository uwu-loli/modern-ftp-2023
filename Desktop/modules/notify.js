const { NotifyManager } = require('notify-manager-electron');

const _style = '.notify{background:#17162dd0!important;background:linear-gradient(90deg, #17162dd0 0%, #1a193ad0 100%) !important;}';
let nmanager;

module.exports = {getManager, update, init};

function getManager() {
    return nmanager;
}

function update(position) {
    try{nmanager.win.close();}catch{}
    nmanager = new NotifyManager(position, _style);
}

function init(position) {
    nmanager = new NotifyManager(position, _style);
}
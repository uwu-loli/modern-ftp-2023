const cryptor = require('./Cryptor');
const config = require('./Config');

const { app } = require('electron');
const path = require('path');
const fs = require('original-fs');

const AppDir = path.join(app.getPath('appData'), 'ModernFileTransfer');
const DBDir = path.join(AppDir, 'Local DataBase');

module.exports = class Document {
    constructor (collection, id, json) {
        this.collection = collection;
        this.json = json;
        this.id = id;
    }

    save(){
        const _file = path.join(DBDir, this.collection, this.id);

        if (!fs.existsSync(AppDir)) fs.mkdirSync(AppDir, {recursive: true});
        if (!fs.existsSync(DBDir)) fs.mkdirSync(DBDir, {recursive: true});

        if (!fs.existsSync(path.join(DBDir, this.collection))){
            fs.mkdirSync(path.join(DBDir, this.collection), {recursive: true});
        }

        let _preData = JSON.stringify(this.json);
        if(config.enabled){
            _preData = cryptor.encrypt(_preData);
        }
        
        fs.writeFileSync(_file, _preData, {encoding: 'binary', flag: 'w', mode: 0o660});
    }
}
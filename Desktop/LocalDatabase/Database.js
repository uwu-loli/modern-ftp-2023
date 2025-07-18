const cryptor = require('./Cryptor');
const config = require('./Config');
const Document = require('./Document');

const { app } = require('electron');
const path = require('path');
const fs = require('original-fs');

const AppDir = path.join(app.getPath('appData'), 'ModernFileTransfer');
const DBDir = path.join(AppDir, 'Local DataBase');

module.exports = class Database {
    static init(){
        if (!fs.existsSync(AppDir)){
            fs.mkdirSync(AppDir, {recursive: true});
        }
        
        if (!fs.existsSync(DBDir)){
            fs.mkdirSync(DBDir, {recursive: true});
        }
    }

    static getAllDocuments(collection){
        const _dir = path.join(DBDir, collection);

        if (!fs.existsSync(_dir)) return [];

        let _result = [];

        const files = fs.readdirSync(_dir);
        for (let i = 0; i < files.length; i++) {
            const _file = files[i];
            let data = fs.readFileSync(path.join(_dir, _file), {encoding:'binary', flag:'r'});
            try{
                if(config.enabled){
                    data = cryptor.decrypt(data);
                }
                const _json = JSON.parse(data);
                if(_json != null && _json != undefined){
                    _result.push(new Document(collection, _file, _json));
                }
            }catch{}
        }

        return _result;
    }

    static getDocumentById(collection, id){
        const _file = path.join(DBDir, collection, id);

        if (!fs.existsSync(_file)) return new Document(collection, id, {});

        let data = fs.readFileSync(_file, {encoding:'binary', flag:'r'});
        try{
            if(config.enabled){
                data = cryptor.decrypt(data);
            }
            const _json = JSON.parse(data);

            if(_json == null || _json == undefined){
                return new Document(collection, id, {});
            }
            
            return new Document(collection, id, _json);
        }catch{
            return new Document(collection, id, {});
        }
    }

    static getDocument(collection, filter){
        const _docs = getAllReservedDocuments();
        const _doc = _docs.find((value, index, obj) => filter(value.json, index, obj));

        if(!_doc) return null;
        
        return new Document(collection, _doc.id, _doc.json);

        function getAllReservedDocuments() {
            const _dir = path.join(DBDir, collection);

            if (!fs.existsSync(_dir)) return [];

            let _result = [];

            const files = fs.readdirSync(_dir);
            for (let i = 0; i < files.length; i++) {
                const _file = files[i];
                try{
                    let data = fs.readFileSync(path.join(_dir, _file), {encoding:'binary', flag:'r'});
                    if(config.enabled){
                        data = cryptor.decrypt(data);
                    }
                    const _json = JSON.parse(data);
                    if(_json != null && _json != undefined){
                        _result.push({json:_json, id:_file});
                    }
                }catch{}
            }

            return _result;
        }
    }
    

    static removeDocumentById(collection, id){
        const _file = path.join(DBDir, collection, id);

        if (!fs.existsSync(_file)) return;

        fs.rmSync(_file, {recursive: true});
    }
}
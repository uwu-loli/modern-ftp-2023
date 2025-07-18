const crypto = require('crypto');
const config = require('./Config');

const staticCrypt = {
    key: crypto.pbkdf2Sync(config.password, config.salt, 10000, 32, 'sha512'),
    encrypt: data => {
        const ciph = crypto.createCipheriv('aes-256-cbc', Buffer.from(staticCrypt.key), Buffer.from('fdgmh&*#Yywg68#R'));
        let str = ciph.update(data);
        str = Buffer.concat([str, ciph.final()]);
        return str.toString('binary');
    },
    decrypt: data => {
        const deciph = crypto.createDecipheriv('aes-256-cbc', Buffer.from(staticCrypt.key), Buffer.from('fdgmh&*#Yywg68#R'));
        let str = deciph.update(Buffer.from(data, 'binary'));
        str = Buffer.concat([str, deciph.final()]);
        return str.toString();
    }
};

module.exports = staticCrypt;
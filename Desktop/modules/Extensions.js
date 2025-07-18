const crypto = require('crypto');

module.exports = {
    sha256: (str) => crypto.createHash('sha256').update(str).digest('hex'),
    guid: (length = 30) => {
        const symbol = () => (Math.random()*35|0).toString(36);
        let str = '';
        for (let i = 0; i < length; i++) {
            str += symbol();
        }
        return str;
    },
}
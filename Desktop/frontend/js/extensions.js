const sleep = ms => new Promise(res => setTimeout(() => res(), ms));

const guid = (length = 30) => {
    const symbol = () => (Math.random()*35|0).toString(36);
    let str = '';
    for (let i = 0; i < length; i++) {
        str += symbol();
    }
    return str;
};

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const dateTimePad = (value, digits) => {
    let number = value
    while (number.toString().length < digits) {
        number = '0' + number
    }
    return number;
}

const ConvertDate = (date) => {
    const time = new Date(parseInt(date));

    let str = dateTimePad(time.getDate(), 2) + '.';
    str += dateTimePad(time.getMonth() + 1, 2) + '.';
    str += dateTimePad(time.getFullYear(), 2) + ' ';
    str += dateTimePad(time.getHours(), 2) + ':';
    str += dateTimePad(time.getMinutes(), 2) + ':';
    str += dateTimePad(time.getSeconds(), 2)

    return str;
}
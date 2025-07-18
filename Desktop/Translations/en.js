module.exports = {
    name: 'English',
    menu: {
        settings: 'Settings'
    },
    settings: {
        title: 'Settings',
        connections: 'Connections',
        createConnect: 'Create connect',
        connect: {
            name: 'Name',
            user: 'User',
            host: 'Host',
            port: 'Port',
            save: 'Save',
            lostPass: 'Lost Password',
            updatePass: 'Save Password',
            new: 'New Connection',
        },
    },
    content: {
        name: 'Name',
        size: 'Size',
        owner: 'Owner',
        rights: 'Rights',
        change: 'Last Change',
        
        progress: 'Progress',
        eta: 'ETA',
        passed: 'Passed',
    },
    modals: {
        crt: {
            title: 'Host certificate has been changed',
            text1: 'Either the OS has been reinstalled',
            text2: 'or your traffic is being intercepted',
            text3: 'Key type:',
            text4: 'Sha1 hash of the host\'s public key',
            cancel: 'Cancel',
            continue: 'Continue',
        },
        exist: {
            title: 'File already exist',
            cancel: 'Cancel',
            replace: 'Replace',
        }
    },
};
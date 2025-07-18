

window.addEventListener('load', async() => {
    const translations = {
        name: 'Name',
        user: 'User',
        host: 'Host',
        port: 'Port',
        lostPass: 'Lost Password',
        updatePass: 'Save Password',
        save: 'Save',
        new: 'New Connection',
    };
    UpdateConnectTranslations(translations);

    document.querySelector('.settings .area type.connections .create').onclick = () => {
        const _json = {name: translations.new, user: 'root', host: '0.0.0.0', port: 22, password: false};
        const uid = guid();

        ipcRenderer.send('connect.create', uid, connects.data.length, _json.name, _json.user, _json.host, _json.port);
        
        connects.data.push({json: _json, id: uid});
        RenderConnect({json: _json, id: uid}, true);
    };

    while (!connects.received) {
        await sleep(100);
    }

    const menu = document.querySelector('.menu .selector');
    const parent = document.querySelector('.settings .area div.connections');

    menu.innerHTML = '';
    parent.innerHTML = '';

/*
{
index: 0,
name: '123',
user: 'root',
host: '1.1.1.1',
port: '22',
password: true,
}
*/
    for (let i = 0; i < connects.data.length; i++) {
        try{ RenderConnect(connects.data[i]) }catch{}
    }

    function RenderConnect(doc, isNew = false) {
        const connect = doc.json;
        const id = doc.id;

        //#region menu
        const menu_server = document.createElement('div');
        menu_server.className = 'server';
        menu.appendChild(menu_server);

        const menu_span = document.createElement('span');
        menu_server.appendChild(menu_span);
        menu_span.onclick = () => CreateSession({
            name: connect.name,
            user: connect.user,
            host: connect.host,
            port: connect.port,
        }, id);
        
        const menu_text = document.createElement('text');
        menu_text.innerHTML = connect.name;
        menu_span.appendChild(menu_text);
        //#endregion



        const settings_connect = document.createElement('div');
        settings_connect.id = id;
        settings_connect.classList.add('connect');
        if(isNew) settings_connect.classList.add('new');
        parent.appendChild(settings_connect);

        //#region header
        const connect_header = document.createElement('div');
        connect_header.className = 'header';
        settings_connect.appendChild(connect_header);

        const connect_header_name = document.createElement('span');
        connect_header_name.innerHTML = connect.name;
        connect_header.appendChild(connect_header_name);

        const connect_header_delete = document.createElement('span');
        connect_header_delete.className = 'delete';
        connect_header_delete.innerHTML = 'X';
        connect_header_delete.onclick = () => {
            settings_connect.classList.add('close');
            setTimeout(() => {
                settings_connect.outerHTML = '';
                menu_server.outerHTML = '';
                ipcRenderer.send('connect.delete', id);
            }, 670);
        };
        connect_header.appendChild(connect_header_delete);
        //#endregion


        //#region setup
        const connect_setup = document.createElement('div');
        connect_setup.className = 'setup';
        connect_setup.style.display = 'none';
        settings_connect.appendChild(connect_setup);

        connect_header.onclick = (ev) => {
            if(ev.target == connect_header_delete) return;
            if(connect_setup.style.display == 'none'){
                connect_setup.style.display = '';
                connect_setup.style.animationName = 'connectSettingsShow';
                connect_setup.style.animationDuration = '.5s';
            }else{
                connect_setup.style.animationName = 'connectSettingsHide';
                connect_setup.style.animationDuration = '.5s';
                setTimeout(() => connect_setup.style.display = 'none', 475);
            }
        };
        
        //#region params
        const setup_params = document.createElement('div');
        setup_params.className = 'params';
        connect_setup.appendChild(setup_params);

        //#region name
        const params_name = document.createElement('span');
        setup_params.appendChild(params_name);
        
        const params_name_label = document.createElement('label');
        params_name_label.innerHTML =  translations['name'];
        params_name.appendChild(params_name_label);
        
        const params_name_input = document.createElement('input');
        params_name_input.oninput = () => params_name_input.value = params_name_input.value.replace(/\n/g, ' ').substring(0, 30);
        params_name_input.value = connect.name;
        params_name.appendChild(params_name_input);
        //#endregion

        //#region user
        const params_user = document.createElement('span');
        setup_params.appendChild(params_user);
        
        const params_user_label = document.createElement('label');
        params_user_label.innerHTML =  translations['user'];
        params_user.appendChild(params_user_label);
        
        const params_user_input = document.createElement('input');
        params_user_input.value = connect.user;
        params_user.appendChild(params_user_input);
        //#endregion

        //#region host
        const params_host = document.createElement('span');
        setup_params.appendChild(params_host);
        
        const params_host_label = document.createElement('label');
        params_host_label.innerHTML =  translations['host'];
        params_host.appendChild(params_host_label);
        
        const params_host_input = document.createElement('input');
        params_host_input.value = connect.host;
        params_host.appendChild(params_host_input);
        //#endregion

        //#region port
        const params_port = document.createElement('span');
        setup_params.appendChild(params_port);
        
        const params_port_label = document.createElement('label');
        params_port_label.innerHTML =  translations['port'];
        params_port.appendChild(params_port_label);
        
        const params_port_input = document.createElement('input');
        params_port_input.oninput = () => params_port_input.value = params_port_input.value.replace(/[^\d]/g, '').substring(0, 5);
        params_port_input.value = connect.port;
        params_port.appendChild(params_port_input);
        //#endregion

        //#endregion

        //#region buttons
        const setup_buttons = document.createElement('div');
        setup_buttons.className = 'buttons';
        connect_setup.appendChild(setup_buttons);
        
        const setup_buttons_passInput = document.createElement('input');
        setup_buttons_passInput.type = 'password';
        if(connect.password) setup_buttons_passInput.style.display = 'none';
        setup_buttons.appendChild(setup_buttons_passInput);
        
        const setup_buttons_passButton = document.createElement('span');
        setup_buttons_passButton.classList.add('pass');
        if(connect.password){
            setup_buttons_passButton.classList.add('lost');
            setup_buttons_passButton.innerHTML = translations['lostPass'];
        }else{
            setup_buttons_passButton.innerHTML = translations['updatePass'];
        }
        setup_buttons_passButton.onclick = () => {
            if(connect.password){
                try{setup_buttons_passButton.classList.remove('lost');}catch{}
                setup_buttons_passButton.innerHTML = translations['updatePass'];
                setup_buttons_passInput.style.display = '';
                ipcRenderer.send('connect.update.password', id, '');
            }else{
                try{setup_buttons_passButton.classList.add('lost');}catch{}
                setup_buttons_passButton.innerHTML = translations['lostPass'];
                setup_buttons_passInput.style.display = 'none';
                ipcRenderer.send('connect.update.password', id, setup_buttons_passInput.value);
                setup_buttons_passInput.value = '';
            }
            connect.password = !connect.password;
        };
        setup_buttons.appendChild(setup_buttons_passButton);
        
        const setup_buttons_save = document.createElement('span');
        setup_buttons_save.className = 'save';
        setup_buttons_save.innerHTML = translations['save'];
        setup_buttons_save.onclick = () => {
            const name = params_name_input.value.replace(/\n/g, ' ').substring(0, 30);
            if(name && name.length > 0) connect.name = name;
            connect.user = params_user_input.value;
            connect.host = params_host_input.value;
            connect.port = params_port_input.value.replace(/[^\d]/g, '').substring(0, 5);

            //id, name, user, host, port
            ipcRenderer.send('connect.update.data', id,
            connect.name, connect.user, connect.host, connect.port);

            menu_text.innerHTML = connect.name;
            connect_header_name.innerHTML = connect.name;
        };
        setup_buttons.appendChild(setup_buttons_save);
        //#endregion

        //#endregion
    }

    

    function UpdateConnectTranslations(translations) {
        let doTranslations = getTranslations();
        if(!doTranslations) return;
        if(!doTranslations['settings']) return;
        let do2 = doTranslations['settings']['connect']; // for optimize..
        if(!do2) return;
        if(do2['name']) translations.name = do2['name'];
        if(do2['user']) translations.user = do2['user'];
        if(do2['host']) translations.host = do2['host'];
        if(do2['port']) translations.port = do2['port'];
        if(do2['save']) translations.save = do2['save'];
        if(do2['lostPass']) translations.lostPass = do2['lostPass'];
        if(do2['updatePass']) translations.updatePass = do2['updatePass'];
        if(do2['new']) translations.new = do2['new'];
    }
});
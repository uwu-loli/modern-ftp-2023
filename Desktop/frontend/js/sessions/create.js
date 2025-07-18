let focusedSession = '';
const activeSessions = [];
/*
{
header: Element,
window: Element,
json: {ip, port, user, name, id},
id: string,
events: {
    stats: {
        onRam: void,
        onCPU: void,
        onDisk: void,
    },
    onLog: void,
}
}
*/

const cachedImages = []; // {type: string, data: string}

function CreateSession(connect, id) {
    const obj = {
        header: null,
        window: null,
        json: {...connect, id},
        id: guid(),
        events: {
            stats: {
                onRam: (perc) => {},
                onCPU: (perc) => {},
                onDisk: (perc, load) => {},
            },
            onLog: (text) => {},
            onConnected: (value) => {},
            onLocalDir: (dir, files) => {},
            onRemoteDir: (dir, files) => {},
        }
    }
    activeSessions.push(obj);

    const translations = GetSessionsTranslate();

    const firstWindow = document.querySelector('.content .serverArea.firstWindow');

    //#region header
    const header = document.querySelector('.content .header');

    const header_connect = document.createElement('div');
    header_connect.className = 'connection';
    header_connect.style.zIndex = '-1';
    header.appendChild(header_connect);
    obj.header = header_connect;

    const header_status = document.createElement('i');
    header_status.className = 'status';
    header_connect.appendChild(header_status);

    const header_name = document.createElement('span');
    header_name.className = 'name';
    header_name.innerHTML = obj.json.name;
    header_connect.appendChild(header_name);

    const header_close = document.createElement('span');
    header_close.className = 'close';
    header_close.innerHTML = 'X';
    header_connect.appendChild(header_close);
    
    let _closing = false;
    header_connect.onclick = (e) => {
        if(_closing) return;
        if(e.target == header_close) return;

        try{
            const cur = activeSessions.find(x => x.id == focusedSession);
            if(!cur) firstWindow.style.display = 'none';
            else{
                cur.header.style.borderTopColor = '';
                cur.window.style.display = 'none';
            }
        }catch{}

        focusedSession = obj.id;
        obj.window.style.display = '';
        obj.header.style.borderTopColor = 'lime';
    };
    header_close.onclick = () => {
        _closing = true;
        header_connect.style.animationName = 'HeaderCloseConnect';
        setTimeout(() => {
            header_connect.outerHTML = '';
            obj.window.outerHTML = '';

            if(focusedSession == obj.id){
                firstWindow.style.display = '';
            }

            const index = activeSessions.indexOf(obj);
            if(index > -1){
                activeSessions.splice(index, 1);
            }
        }, 490);
        ipcRenderer.send('session.close', obj.id);
    };
    //#endregion

    const area = document.createElement('div');
    area.className = 'serverArea';
    area.style.display = 'none';
    document.querySelector('.content').appendChild(area);
    obj.window = area;

    //#region files
    const files = document.createElement('div');
    files.className = 'files';
    area.appendChild(files);

    //#region local
    const files_local = document.createElement('div');
    files_local.className = 'local';
    files.appendChild(files_local);
    

    //#region head
    let local_directory_clicked = false;

    const files_local_head = document.createElement('div');
    files_local_head.className = 'head';
    files_local.appendChild(files_local_head);

    const files_local_head_back = document.createElement('b');
    files_local_head_back.className = 'back';
    files_local_head_back.innerHTML = '{';
    files_local_head.appendChild(files_local_head_back);
    files_local_head_back.onclick = () => {
        const attr = files_local_head_back.getAttribute('back-to');
        if(!attr) return;
        if(local_directory_clicked) return;
        local_directory_clicked = true;
        setTimeout(() => local_directory_clicked = false, 500);
        ipcRenderer.send('session.set.local.dir', obj.id, attr);
    };

    const files_local_head_dir = document.createElement('span');
    files_local_head_dir.className = 'directory';
    files_local_head.appendChild(files_local_head_dir);
    files_local_head_dir.onwheel = (ev) => {
        files_local_head_dir.scrollLeft += ev.deltaY;
        return false;
    }

    const local_directory = document.createElement('text');
    files_local_head_dir.appendChild(local_directory);
    local_directory.onclick = (ev) => {
        if(ev.target.tagName.toLowerCase() != 'b') return;
        const attr = ev.target.getAttribute('click-path');
        if(!attr) return;
        if(local_directory_clicked) return;
        local_directory_clicked = true;
        setTimeout(() => local_directory_clicked = false, 500);
        ipcRenderer.send('session.set.local.dir', obj.id, attr);
    }

    const files_local_head_search = document.createElement('b');
    files_local_head_search.className = 'search';
    files_local_head_search.innerHTML = '?';
    files_local_head.appendChild(files_local_head_search);
    files_local_head_search.onclick = () => {// todo

    };
    //#endregion

    //#region area
    const files_local_area = document.createElement('div');
    files_local_area.className = 'area';
    files_local.appendChild(files_local_area);

    const files_local_area_desc = document.createElement('div');
    files_local_area_desc.className = 'file';
    files_local_area_desc.style.height = '22px';
    files_local_area_desc.style.cursor = 'default';
    files_local_area_desc.innerHTML  = '<span></span>';
    files_local_area_desc.innerHTML += '<span>' + translations.name + '</span>';
    files_local_area_desc.innerHTML += '<span>' + translations.size + '</span>';
    files_local_area_desc.innerHTML += '<span>' + translations.change + '</span>';
    files_local_area.appendChild(files_local_area_desc);

    const files_local_area_scroll = document.createElement('div');
    files_local_area_scroll.className = 'files-scroll';
    files_local_area.appendChild(files_local_area_scroll);

    const files_local_loads = document.createElement('div');
    files_local_loads.className = 'loads';
    files_local_area_scroll.append(files_local_loads);
    //#endregion
    obj.events.onLocalDir = (dir, files) => {
        let _clickDir = '';
        if(dir.startsWith('/')){
            _clickDir += '/';
            dir = dir.substring(1);
        }

        local_directory.innerHTML = _clickDir;
        const dirArr = dir.split('/').filter(x => x.length > 0);

        for (let i = 0; i < dirArr.length; i++) {
            const dirEl = dirArr[i];
            _clickDir += dirEl + '/';

            const _el = document.createElement('b');
            _el.innerHTML = dirEl;
            _el.setAttribute('click-path', _clickDir);
            local_directory.appendChild(_el);
            local_directory.innerHTML += '/';
        }

        files_local_head_back.setAttribute('back-to', _clickDir + '..');

        /*
        {
            name: string,
            size: number,
            change: number,
            directory: boolean,
        }
        */
        files_local_loads.innerHTML = '';
        files = files.sort((a, b) => {
            if(b.directory) return 1;
            if(a.directory) return -1;
            return 0;
        });
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            const fileEl = document.createElement('div');
            fileEl.className = 'file';
            files_local_loads.appendChild(fileEl);
            if(file.directory){
                fileEl.setAttribute('onclick', `ipcRenderer.send('session.set.local.dir', '${obj.id}', '${_clickDir + file.name}')`);
            }else{
                fileEl.setAttribute('onclick', `ipcRenderer.send('session.open.file', '${_clickDir}', '${file.name}')`);
            }

            const _icon = document.createElement('span');
            _icon.className = 'icon';

            fileEl.innerHTML += '<span class="name">'+ file.name +'</span>';
            fileEl.innerHTML += '<span class="size">'+ (file.directory && !(1 >= _clickDir.length) ? '-' : formatBytes(file.size)) +'</span>';
            fileEl.innerHTML += '<span class="change">'+ ConvertDate(file.change) +'</span>';
            
            fileEl.insertBefore(_icon, fileEl.children[0]);

            if(file.directory){
                _icon.style.backgroundImage = 'url("' + window.location.href + '/../../icons/folder.png' + '")';
            }
            const reqUid = guid();
            ipcRenderer.once('session.get.file.icon.' + reqUid, (_, icon) => {
                if(icon) _icon.style.backgroundImage = 'url("' + icon + '")';
            });
            ipcRenderer.send('session.get.file.icon', reqUid, _clickDir, {isDir: file.directory, name: file.name});
        }
        files_local_loads.scrollIntoView();
    };
    //#endregion

    //#region remote
    const files_remote = document.createElement('div');
    files_remote.className = 'remote';
    files.appendChild(files_remote);
    

    //#region head
    let remote_directory_clicked = false;
    let remote_directory_clicked_id = 0;

    const files_remote_head = document.createElement('div');
    files_remote_head.className = 'head';
    files_remote.appendChild(files_remote_head);

    const files_remote_head_back = document.createElement('b');
    files_remote_head_back.className = 'back';
    files_remote_head_back.innerHTML = '{';
    files_remote_head.appendChild(files_remote_head_back);
    files_remote_head_back.onclick = () => {
        const attr = files_remote_head_back.getAttribute('back-to');
        if(!attr) return;
        if(remote_directory_clicked) return;
        remote_directory_clicked = true;
        remote_directory_clicked_id++;
        const _id = remote_directory_clicked_id;
        setTimeout(() => {
            if(_id != remote_directory_clicked_id) return;
            remote_directory_clicked = false;
        }, 1500);
        ipcRenderer.send('session.set.remote.dir', obj.id, attr);
    };

    const files_remote_head_dir = document.createElement('span');
    files_remote_head_dir.className = 'directory';
    files_remote_head.appendChild(files_remote_head_dir);
    files_remote_head_dir.onwheel = (ev) => {
        files_remote_head_dir.scrollLeft += ev.deltaY;
        return false;
    }

    const remote_directory = document.createElement('text');
    files_remote_head_dir.appendChild(remote_directory);
    remote_directory.onclick = (ev) => {
        if(ev.target.tagName.toLowerCase() != 'b') return;
        const attr = ev.target.getAttribute('click-path');
        if(!attr) return;
        if(remote_directory_clicked) return;
        remote_directory_clicked_id++;
        const _id = remote_directory_clicked_id;
        setTimeout(() => {
            if(_id != remote_directory_clicked_id) return;
            remote_directory_clicked = false;
        }, 1500);
        ipcRenderer.send('session.set.remote.dir', obj.id, attr);
    }

    const files_remote_head_search = document.createElement('b');
    files_remote_head_search.className = 'search';
    files_remote_head_search.innerHTML = '?';
    files_remote_head.appendChild(files_remote_head_search);
    files_remote_head_search.onclick = () => {// todo

    };
    //#endregion

    //#region area
    const files_remote_area = document.createElement('div');
    files_remote_area.className = 'area';
    files_remote.appendChild(files_remote_area);
    
    files_remote_area.ondragover = files_remote_area.ondragenter = (e) => {
        e.stopPropagation();
        e.preventDefault();
    }
    files_remote_area.ondrop = (e) => {
        e.stopPropagation();
        e.preventDefault();
        let path = files_remote_loads.getAttribute('current-path');
        if(e.target.classList.contains('directory')){
            path = e.target.getAttribute('directory') ?? path;
        }
        if(!path){
            console.error('Path is null or undefined');
            return;
        }
        console.log(path);
        const arr = e.dataTransfer.files;
        for (let i = 0; i < arr.length; i++) {
            const file = arr[i];
            ipcRenderer.send('session.file.upload', obj.id, path, file.path, file.name);
        }
    }

    const files_remote_area_desc = document.createElement('div');
    files_remote_area_desc.className = 'file';
    files_remote_area_desc.style.height = '22px';
    files_remote_area_desc.style.cursor = 'default';
    files_remote_area_desc.innerHTML  = '<span></span>';
    files_remote_area_desc.innerHTML += '<span>' + translations.name + '</span>';
    files_remote_area_desc.innerHTML += '<span>' + translations.size + '</span>';
    files_remote_area_desc.innerHTML += '<span>' + translations.rights + '</span>';
    files_remote_area_desc.innerHTML += '<span>' + translations.owner + '</span>';
    files_remote_area_desc.innerHTML += '<span>' + translations.change + '</span>';
    files_remote_area.appendChild(files_remote_area_desc);

    const files_remote_area_scroll = document.createElement('div');
    files_remote_area_scroll.className = 'files-scroll';
    files_remote_area.appendChild(files_remote_area_scroll);

    const files_remote_loads = document.createElement('div');
    files_remote_loads.className = 'loads';
    files_remote_area_scroll.append(files_remote_loads);
    //#endregion
    obj.events.onRemoteDir = (dir, files) => {
        let _clickDir = '';
        if(dir.startsWith('/')){
            _clickDir += '/';
            dir = dir.substring(1);
        }

        remote_directory.innerHTML = _clickDir;
        const dirArr = dir.split('/').filter(x => x.length > 0);

        for (let i = 0; i < dirArr.length; i++) {
            const dirEl = dirArr[i];
            _clickDir += dirEl + '/';

            const _el = document.createElement('b');
            _el.innerHTML = dirEl;
            _el.setAttribute('click-path', _clickDir);
            remote_directory.appendChild(_el);
            remote_directory.innerHTML += '/';
        }

        files_remote_head_back.setAttribute('back-to', _clickDir + '..');

        /*
        {
            name: string,
            size: number,
            change: number,
            chmod: string,
            rights: string,
            owner: string,
            directory: boolean,
        }
        */
        files_remote_loads.innerHTML = '';
        files = files.sort((a, b) => {
            if(b.directory) return 1;
            if(a.directory) return -1;
            return 0;
        });
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            const fileEl = document.createElement('div');
            fileEl.className = 'file';
            files_remote_loads.appendChild(fileEl);
            if(file.directory){
                fileEl.setAttribute('onclick', `ipcRenderer.send('session.set.remote.dir', '${obj.id}', '${_clickDir + file.name}')`);
                fileEl.setAttribute('directory', _clickDir + file.name);

                fileEl.classList.add('directory');
                fileEl.ondragenter = () => fileEl.classList.add('active');
                fileEl.ondragleave = () => fileEl.classList.remove('active');
                fileEl.ondragend = () => fileEl.classList.remove('active');
                fileEl.ondrag = () => fileEl.classList.remove('active');
                fileEl.ondrop = () => fileEl.classList.remove('active');
            }else{
                fileEl.setAttribute('onclick', `ipcRenderer.send('session.edit.remote.file', '${_clickDir}', '${file.name}')`);
            }

            const _icon = document.createElement('span');
            _icon.className = 'icon';

            fileEl.innerHTML += '<span class="name">'+ file.name +'</span>';
            fileEl.innerHTML += '<span class="size">'+ (file.directory && !(1 >= _clickDir.length) ? '-' : formatBytes(file.size)) +'</span>';
            fileEl.innerHTML += '<span class="chmod" chmod="'+ file.chmod +'" rights="'+ file.rights +'"></span>';
            fileEl.innerHTML += '<span class="owner">'+ file.owner +'</span>';
            fileEl.innerHTML += '<span class="change">'+ file.change +'</span>';
            
            fileEl.insertBefore(_icon, fileEl.children[0]);
            
            if(file.directory){
                continue;
            }
            
            if(!file.name.includes('.') || (file.name.startsWith('.') && 2 > (file.name.match(/[.]/g) || []).length)){
                continue;
            }

            const _type = file.name.split('.').slice(-1).join('.');
            const _image = cachedImages.find(x => x.type == _type);
            if(_image){
                _icon.style.backgroundImage = 'url("' + _image.data + '")';
            }else{
                const reqUid = guid();
                ipcRenderer.once('session.get.file.icon.static.' + reqUid, (_, icon) => {
                    if(!icon) return;
                    _icon.style.backgroundImage = 'url("' + icon + '")';
                    if(!cachedImages.includes(x => x.type == _type)){
                        cachedImages.push({type:_type, data:icon});
                    }
                });
                ipcRenderer.send('session.get.file.icon.static', reqUid, _type);
            }
        }
        files_remote_loads.scrollIntoView();
        setTimeout(() => remote_directory_clicked = false, 500);
        files_remote_loads.setAttribute('current-path', _clickDir);
    };
    //#endregion

    //#endregion

    //#region status
    const status = document.createElement('div');
    status.className = 'status';
    area.appendChild(status);

    //#region info
    const status_info = document.createElement('div');
    status_info.className = 'info';
    status.appendChild(status_info);

    //#region downloads
    const status_info_downloads = document.createElement('div');
    status_info_downloads.className = 'downloads';
    status_info.appendChild(status_info_downloads);

    const status_info_downloads_head = document.createElement('div');
    status_info_downloads_head.className = 'head';
    status_info_downloads_head.innerHTML  = '<span>' + translations.name + '</span>';
    status_info_downloads_head.innerHTML += '<span>' + translations.progress + '</span>';
    status_info_downloads_head.innerHTML += '<span>' + translations.size + '</span>';
    status_info_downloads_head.innerHTML += '<span>' + translations.eta + '</span>';
    status_info_downloads_head.innerHTML += '<span>' + translations.passed + '</span>';
    status_info_downloads.appendChild(status_info_downloads_head);

    const downloadsTasks = document.createElement('div');
    downloadsTasks.className = 'tasks';
    status_info_downloads.appendChild(downloadsTasks);
    //#endregion

    //#region logs
    const status_info_logs = document.createElement('div');
    status_info_logs.className = 'logs';
    status_info.appendChild(status_info_logs);

    const logsArea = document.createElement('div');
    logsArea.className = 'area';
    status_info_logs.appendChild(logsArea);

    obj.events.onLog = (text) => {
        const log = document.createElement('span');
        log.innerHTML = text;
        if(logsArea.childElementCount == 0) {
            logsArea.appendChild(log);
        }else{
            logsArea.insertBefore(log, logsArea.children[0]);
        }

        if(logsArea.childElementCount > 100){
            for (let i = logsArea.childElementCount - 30; i < logsArea.childElementCount; i++) {
                try{logsArea.children[i].remove();}catch{}
            }
        }
    };
    //#endregion

    //#endregion

    //#region stats
    const status_stats = document.createElement('div');
    status_stats.className = 'stats';
    status.appendChild(status_stats);

    //#region cpu
    {
        const status_stats_area = document.createElement('div');
        status_stats_area.className = 'stat';
        status_stats.appendChild(status_stats_area);
    
        const status_stats_area_container = document.createElement('div');
        status_stats_area_container.className = 'cont cpu';
        status_stats_area.append(status_stats_area_container);
    
        let _cached_data = 0;
        obj.events.stats.onCPU = async(perc) => {
            const cf = _cached_data > perc ? -1 : 1;
            const diff = Math.abs(perc - _cached_data);
            const wait = diff / 250;
            let count = 0
            while(count < diff){
                count++;
                status_stats_area_container.style.setProperty('--percent', _cached_data + (count * cf));
                await sleep(wait);
            }
            _cached_data = perc;
            status_stats_area_container.style.setProperty('--percent', perc);
        }
    }
    //#endregion

    //#region ram
    {
        const status_stats_area = document.createElement('div');
        status_stats_area.className = 'stat';
        status_stats.appendChild(status_stats_area);
    
        const status_stats_area_container = document.createElement('div');
        status_stats_area_container.className = 'cont ram';
        status_stats_area.append(status_stats_area_container);
    
        let _cached_data = 0;
        obj.events.stats.onRam = async(perc) => {
            const cf = _cached_data > perc ? -1 : 1;
            const diff = Math.abs(perc - _cached_data);
            const wait = diff / 250;
            let count = 0
            while(count < diff){
                count++;
                status_stats_area_container.style.setProperty('--percent', _cached_data + (count * cf));
                await sleep(wait);
            }
            _cached_data = perc;
            status_stats_area_container.style.setProperty('--percent', perc);
        }
    }
    //#endregion

    //#region disk
    {
        const status_stats_area = document.createElement('div');
        status_stats_area.className = 'stat';
        status_stats.appendChild(status_stats_area);
    
        const status_stats_area_container = document.createElement('div');
        status_stats_area_container.className = 'cont disk';
        status_stats_area.append(status_stats_area_container);
        status_stats_area_container.setAttribute('stats-data', '0B');
    
        let _cached_data = 0;
        obj.events.stats.onDisk = async(perc, value) => {
            status_stats_area_container.setAttribute('stats-data', formatBytes(value, 1).replace(' ', ''));
            const cf = _cached_data > perc ? -1 : 1;
            const diff = Math.abs(perc - _cached_data);
            const wait = diff / 250;
            let count = 0
            while(count < diff){
                count++;
                status_stats_area_container.style.setProperty('--percent', _cached_data + (count * cf));
                await sleep(wait);
            }
            _cached_data = perc;
            status_stats_area_container.style.setProperty('--percent', perc);
        }
    }
    //#endregion

    //#endregion

    //#endregion

    obj.events.onConnected = (value) => {
        header_status.style.backgroundColor = value ? '#35ff28' : '#ff2828';
    }
    header_status.style.backgroundColor = '#ffbd28';

    header_connect.click();
    ipcRenderer.send('session.set.local.dir', obj.id, (downloadsPath == '' ? 'C:/' : downloadsPath));

    ipcRenderer.send('session.create', obj.id, id);





    /*
    area.setAttribute('ondragstart', 'return true;');
    area.setAttribute('ondrop', 'return true;');
    area.ondragover = area.ondragenter = function(event) {
        event.stopPropagation();
        event.preventDefault();
    }
    area.ondrop = function(event) {
        event.stopPropagation();
        event.preventDefault();
        const filesArray = event.dataTransfer.files;
        for (let i=0; i<filesArray.length; i++) {
            console.log(filesArray[i]);
        }
        console.log('--');
    }
    */

    function GetSessionsTranslate(){
        const translations = {
            name: 'Name',
            size: 'Size',
            owner: 'Owner',
            rights: 'Rights',
            change: 'Last Change',
            
            progress: 'Progress',
            eta: 'ETA',
            passed: 'Passed',
        }

        try{
            const global = getTranslations();
            if(!global) return translations;

            const cont = global['content'];
            if(!cont) return cont;

            if(cont.name) translations.name = cont.name;
            if(cont.size) translations.size = cont.size;
            if(cont.owner) translations.owner = cont.owner;
            if(cont.rights) translations.rights = cont.rights;
            if(cont.change) translations.change = cont.change;
            
            if(cont.progress) translations.progress = cont.progress;
            if(cont.eta) translations.eta = cont.eta;
            if(cont.passed) translations.passed = cont.passed;
        }catch{}

        return translations;
    }
}
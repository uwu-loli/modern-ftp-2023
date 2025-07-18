window.addEventListener('load', () => {
    const panel = document.querySelector('panel.settings');
    const content = document.querySelector('.content');

    let _inScroll = false;
    const scroll = () => {
        if(_inScroll) return;
        _inScroll = true;
        setTimeout(() => _inScroll = false, 700);
        
        if(panel.style.display == 'none'){
            panel.style = '';
            content.style.animationName = 'settingsPanelHide';
            content.style.animationDuration = '.7s';
            setTimeout(() => content.style = 'display: none;', 675);
        }else{
            panel.style.animationName = 'settingsPanelHide';
            panel.style.animationDuration = '.7s';
            setTimeout(() => panel.style = 'display: none;', 675);

            content.style = '';
            content.style.animationName = 'settingsPanelShow';
            content.style.animationDuration = '.7s';
        }
    }
    document.querySelector('.menu .settings span').onclick = scroll;
    document.querySelector('panel.settings .area .title .back').onclick = scroll;
})
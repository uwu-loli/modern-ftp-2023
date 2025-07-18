window.addEventListener('load', () => TranslateAll());

function TranslateAll(){
    const translations = getTranslations();

    if(!translations) return;

    TranslateArea('menu', translations);
    TranslateArea('settings', translations);
    TranslateArea('content', translations);

};

function TranslateArea(name, translations = null) {
    if(!translations) translations = getTranslations();
    const elements = document.querySelectorAll('.' + name + ' [translate]');
    const translate = translations[name];
    for (let i = 0; i < elements.length && translate; i++) {
        const element = elements[i];
        const type = element.getAttribute('translate');
        const current = translate[type];
        if(current && element.innerHTML != current){
            element.innerHTML = current;
        }
    }
};
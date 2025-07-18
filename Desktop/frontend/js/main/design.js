(() => {
const scrollContainer = document.querySelector('.content .header');

scrollContainer.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    scrollContainer.scrollLeft += ev.deltaY;
});
})();
(() => {
const header = document.querySelector('.content .header');
let last = header.children.length;
setInterval(() => {
    if(last == header.children.length) return;
    for (let i = 0; i < header.children.length; i++) {
        try{
            header.children[i].style.zIndex = header.children.length - i;
        }catch{}
    }
}, 100);
})();
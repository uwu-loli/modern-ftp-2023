module.exports = {
    name: 'Русский',
    menu: {
        settings: 'Настройки'
    },
    settings: {
        title: 'Настройки',
        connections: 'Подключения',
        createConnect: 'Создать подключение',
        connect: {
            name: 'Название',
            user: 'Пользователь',
            host: 'Хост',
            port: 'Порт',
            save: 'Сохранить',
            lostPass: 'Забыть пароль',
            updatePass: 'Сохранить пароль',
            new: 'Новый коннект',
        },
    },
    content: {
        name: 'Название',
        size: 'Размер',
        owner: 'Владелец',
        rights: 'Права',
        change: 'Последнее изменение',
        
        progress: 'Прогресс',
        eta: 'Осталось',
        passed: 'Прошло',
    },
    modals: {
        crt: {
            title: 'Сертификат хоста был изменен',
            text1: 'Либо была переустановлена ОС,',
            text2: 'либо Ваш трафик перехватывают',
            text3: 'Тип ключа:',
            text4: 'Sha1 публичного ключа хоста',
            cancel: 'Отмена',
            continue: 'Продолжить',
        },
        exist: {
            title: 'Файл уже существует',
            cancel: 'Отмена',
            replace: 'Заменить',
        }
    },
};
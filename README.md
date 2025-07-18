# modern‑ftp‑2023 📂🚀

[![GitHub stars](https://img.shields.io/github/stars/Shiro-nn/modern-ftp-2023?style=social)](https://github.com/Shiro-nn/modern-ftp-2023/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Shiro-nn/modern-ftp-2023?style=social)](https://github.com/Shiro-nn/modern-ftp-2023/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Shiro-nn/modern-ftp-2023)](https://github.com/Shiro-nn/modern-ftp-2023/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/Shiro-nn/modern-ftp-2023)](https://github.com/Shiro-nn/modern-ftp-2023/commits)
[![License: MIT](https://img.shields.io/github/license/Shiro-nn/modern-ftp-2023)](LICENSE)
[![Status: Archived](https://img.shields.io/badge/status-archived-lightgrey.svg)](#)

![Repo Stats](https://github-readme-stats.vercel.app/api/pin/?username=Shiro-nn\&repo=modern-ftp-2023)

> **modern‑ftp‑2023** — универсальный клиент для FTP и SFTP c современным интерфейсом. Настольное приложение на базе **Electron 26** (Acrylic‑Window на Windows) поддерживает вкладки, drag‑&‑drop, уведомления и тёмную тему. Дополнительные CLI‑ядра на **.NET 6** и **Rust** обеспечивают быструю обработку данных. Проект переведён в **архив**: оставлен *as‑is*, без дальнейших обновлений.

---

## ⚡ Ключевые возможности

* **Полноценный GUI** (папка `Desktop/`) — вкладки соединений, локальная/удалённая панель файлов, статус‑бар со статистикой и журналом логов.
* **Поддержка FTP и SFTP**:

  * `Client-FTP-Test/` — FTP‑ядро на **FluentFTP** (.NET 6).
  * `Client-SFTP-CS/` — SFTP‑ядро на **SSH.NET** (.NET 6).
  * `Client-SFTP/` — альтернативный SFTP‑клиент на **Rust + ssh2**.
* **Безопасность** — проверка SHA‑256 хост‑сертификатов, кеширование FingerPrint в `AppData/ModernFileTransfer/Certificates`.
* **Настраиваемые уведомления** (`notify-manager-electron`) и акриловый эффект на Windows.
* **Локальная база JSON** (`LocalDatabase/`) для хранения подключений.
* **Горячие обновления** / авто‑рестарт ядра при появлении новой версии.

---

## 📦 Структура

| Директория / файл  | Технологии                   | Назначение                                                  |
| ------------------ | ---------------------------- | ----------------------------------------------------------- |
| `Desktop/`         | **Electron 26**, HTML/CSS/JS | Главный GUI‑клиент (init.js, frontend, modules).            |
| `Client-FTP-Test/` | .NET 6 C# + FluentFTP        | Консольный FTP‑клиент, собирается в `Build/`.               |
| `Client-SFTP-CS/`  | .NET 6 C# + SSH.NET          | Консольный SFTP‑клиент с поддержкой многозадачных загрузок. |
| `Client-SFTP/`     | Rust 2021 + ssh2 / minreq    | Мини‑SFTP для Linux/Windows (cargo build).                  |
| `Bins/`            | —                            | Иконки (.ico, .png) и ресурсы.                              |
| `HostUtil/`        | Rust 2021                    | Вспомогательные утилиты (сетевой порт, сертификаты).        |
| `targetOS.txt`     | текст                        | Отладочный файл, фиксирует целевые платформы сборки.        |

---

## 🚀 Быстрый старт (GUI)

```bash
# 1. Клон репозитория
git clone https://github.com/Shiro-nn/modern-ftp-2023.git
cd modern-ftp-2023/Desktop

# 2. Установка зависимостей
npm install

# 3. Запуск в режиме разработки
npm start                # или electron .
```

*Требуется Node.js >= 18. Для Windows активируется Acrylic‑режим, для macOS/Linux — стандартная прозрачность.*

### Сборка установщика (Windows x64)

```bash
npm run make             # см. electron‑forge config
```

---

## 🛠️ CLI‑ядра

### FTP (.NET 6)

```bash
cd ../Client-FTP-Test
dotnet publish -c Release -r win-x64   # см. deleteLater.txt
```

### SFTP (.NET 6)

```bash
cd ../Client-SFTP-CS
dotnet publish -c Release -r linux-x64 # win‑, linux‑, osx‑ runtime
```

### SFTP (Rust)

```bash
cd ../Client-SFTP
cargo build --release
```

Исполняемые файлы можно поместить в `Desktop/Bins/` — GUI автоматически найдёт их при запуске.

---

## 🗺️ Мини‑архитектура

```mermaid
graph TD
    subgraph GUI (Electron)
        A[Desktop] -- IPC/Socket --> B[Client‑FTP-Test]
        A -- IPC/Socket --> C[Client‑SFTP‑CS]
        A -- IPC/Socket --> D[Client‑SFTP]
    end
    B & C & D --> E[(Remote Servers)]
```

---

## 🛠️ Зависимости

* **Electron 26 / electron-acrylic-window**
* **FluentFTP** 46, **SSH.NET** 2020, **ssh2‑rs**
* **notify‑manager‑electron**, **open‑with**, **qurre‑socket**
* **Node.js 18+**, **.NET SDK 6** (CLI), **Rust 1.74+** (CLI)

---

## 🤝 Вклад

Репозиторий **заморожен**. Патчи принимаются только для критических уязвимостей. Для новых фич — форкните проект.

---

## ⚖️ Лицензия

Код распространяется под лицензией **MIT** (см. `LICENSE`).

> Спасибо, что выбрали Modern FT! Пусть этот архив поможет вам управлять файлами быстрее.

# Spectrum V2 — сайт

Статический сайт проекта Spectrum V2 (Minecraft RP/SMP).

## Как залить на GitHub Pages

1. Создай новый репозиторий на GitHub (Public).
2. Загрузи **все** файлы и папки из этого проекта (сохрани структуру: `css/`, `js/` — это папки).
3. В репозитории открой **Settings → Pages**.
4. **Source**: `Deploy from a branch` → **Branch**: `main` → папка `/ (root)` → **Save**.
5. Через 1–2 минуты сайт будет доступен по адресу:
   `https://ТВОЙ_НИК.github.io/ИМЯ_РЕПОЗИТОРИЯ/`

## Firebase — обязательно!

Чтобы работали регистрация и база, добавь домен GitHub в разрешённые:

1. Открой [Firebase Console](https://console.firebase.google.com/) → свой проект → **Authentication** → **Settings** → **Authorized domains**.
2. Добавь: `ТВОЙ_НИК.github.io`

Без этого Firebase блокирует запросы и логин не работает.

## Структура

- `index.html` — вся разметка и модалки
- `css/` — стили (base → layout → components → modals → responsive)
- `js/` — логика по модулям (порядок подключения важен, он уже задан в index.html)
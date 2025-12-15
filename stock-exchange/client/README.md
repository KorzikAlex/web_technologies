# Клиент биржи - Stock Exchange Client

Клиентская часть веб-приложения для торговли акциями на бирже. Разработана с использованием Vue 3, Vuetify, TypeScript и WebSocket для обновлений в реальном времени.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## 🧪 Тестирование

Проект содержит полный набор E2E тестов с использованием Playwright (headless-браузер).

### Установка тестовых зависимостей

```sh
# Установить браузеры для Playwright
npx playwright install chromium
```

### Запуск тестов

```sh
# Запуск всех тестов
npm test

# Запуск в UI режиме (интерактивно)
npm run test:ui

# Запуск с отладкой
npm run test:debug

# Запуск в headed режиме (видимый браузер)
npm run test:headed

# Показать отчет о тестах
npm run test:report
```

### Что тестируется

Тесты проверяют:

- ✅ Покупку и продажу акций
- ✅ Изменение баланса брокера
- ✅ Расчет прибыли/убытка после изменения цен
- ✅ Авторизацию и навигацию
- ✅ Отображение графиков с начала торгов
- ✅ WebSocket обновления в реальном времени

**📖 Подробная документация по тестам: [E2E_TESTS.md](E2E_TESTS.md)**

## 🏗️ Структура проекта

```text
client/
├── e2e/                    # E2E тесты (Playwright)
│   ├── helpers/           # Вспомогательные функции для тестов
│   ├── trading.spec.ts    # Тесты торговли акциями
│   └── ui.spec.ts         # Тесты UI и функционала
├── src/
│   ├── pages/             # Страницы приложения
│   ├── shared/            # Переиспользуемые компоненты
│   ├── interfaces/        # TypeScript интерфейсы
│   ├── router/            # Vue Router
│   └── guard/             # Auth guard
├── playwright.config.ts   # Конфигурация Playwright
└── package.json
```

## 🚀 Функционал

- **Авторизация брокера** по ID
- **Просмотр акций** на бирже с текущими ценами
- **Покупка/продажа акций** с проверкой баланса
- **Портфель** с расчетом прибыли/убытка
- **Графики** изменения цен (с начала торгов)
- **Real-time обновления** через WebSocket
- **Адаптивный UI** на базе Vuetify

## ⚙️ Технологии

- **Vue 3** - прогрессивный JavaScript фреймворк
- **TypeScript** - типизированный JavaScript
- **Vuetify 3** - Material Design компоненты
- **Vue Router** - маршрутизация
- **Socket.io Client** - WebSocket соединение
- **Chart.js** + **vue-chartjs** - графики
- **Playwright** - E2E тестирование
- **Vite** - сборщик и dev-сервер

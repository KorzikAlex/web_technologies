/**
 * @file server.ts
 * @fileOverview Express сервер для веб-приложения с аутентификацией.
 * @author KorzikAlex
 * @version 1.0
 * @license MIT
 * @module server
 */
import express, {type Express, type NextFunction, type Request, type Response} from 'express';
import session from 'express-session'
import flash from 'connect-flash';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import passport from "passport";
import createDebug, {type Debugger} from 'debug';
import type {Server} from "node:net";

import authRouter from './routes/auth.js';
import booksRouter from './routes/books.js';

const debug: Debugger = createDebug('todos:server');

const app: Express = express(); // Создаем экземпляр Express приложения

const host: string = 'localhost'; // Хост сервера
const port: number = parseInt(process.env.PORT || '3000', 10); // Порт сервера

const __filename: string = fileURLToPath(import.meta.url); // Получаем имя текущего файла
const __dirname: string = path.dirname(__filename); // Получаем директорию текущего файла

// Настройка шаблонизатора Pug
app.set('view engine', 'pug'); // Устанавливаем Pug в качестве движка шаблонов
app.set('views', path.join(__dirname, '../src/views')); // Устанавливаем директорию для шаблонов

// Middleware
app.use(bodyParser.json()); // Парсим JSON тела запросов
app.use(bodyParser.urlencoded({extended: true})); // Парсим URL-кодированные тела запросов
app.use(cookieParser()); // Парсим cookies

// Подключение статических файлов
const projectRoot: string = path.resolve(__dirname, '..'); // Корневая директория проекта

app.use(express.static(path.join(projectRoot, 'public'))); // Статические файлы из public
// app.use(express.static(path.join(projectRoot, 'public', 'js'))); // Статические файлы JS
app.use(
    '/vendor/fontawesome/css',
    express.static(path.join(projectRoot, 'node_modules', '@fortawesome', 'fontawesome-free', 'css'))
); // Статические файлы FontAwesome CSS


app.use(
    '/vendor/fontawesome/webfonts',
    express.static(path.join(projectRoot, 'node_modules', '@fortawesome', 'fontawesome-free', 'webfonts'))
); // Статические файлы FontAwesome Webfonts

// Сессии
app.use(session({
    secret: 'library-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 24 * 60 * 60 * 1000} // 24 часа
}));
app.use(flash());

app.use(passport.initialize()); // Инициализация Passport
app.use(passport.session()); // Использование сессий Passport

app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.messages = req.flash();
    next();
});

// Маршруты
app.use('/auth', authRouter); // Маршруты аутентификации
app.use('/books', booksRouter);

app.get('/', (req: Request, res: Response, next: NextFunction): void => {
        if (!req.isAuthenticated()) {
            res.redirect('auth/login');
        } else {
            res.redirect('/books');
        }
    }
); // Главная страница перенаправляет на страницу входа

// Запуск сервера
const server: Server = app.listen(port, host); // Запускаем сервер
server.on('error', onError); // Обработчик ошибок сервера
server.on('listening', onListening); // Обработчик события прослушивания сервера

/**
 * Обработчик ошибок сервера.
 * @param error
 */
function onError(error: any): void {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind: string = 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Обработчик событий прослушивания сервера.
 */
function onListening(): void {
    const addr = server.address();
    const bind: string = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr!.port;
    debug('Listening on ' + bind);
}

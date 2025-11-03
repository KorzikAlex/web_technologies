/**
 * @file server.ts
 * @fileOverview Express сервер
 * @module server
 */
import express, {type Express, type Request, type Response} from "express";
import path from "node:path";

import authRouter from "./routes/auth.js";
import friendsRouter from "./routes/friends.js";
import imRouter from "./routes/im.js";
import {feedRouter} from "./routes/feed.js";
import passport from "passport";
import session from "express-session";
import fs from "fs";
import * as https from "node:https";
import {Server} from "node:https";
import * as http from "node:http";

const app: Express = express(); // Создаем экземпляр Express приложения

const host: string = 'localhost'; // Хост сервера
const port: number = parseInt(process.env.PORT ?? '3000', 10); // Порт сервера

const __dirname: string = path.resolve(import.meta.dirname); // Получаем текущую директорию

app.set('view engine', 'pug'); // Устанавливаем Pug в качестве шаблонизатора
app.set('views', path.join(__dirname, './views')); // Указываем директорию для шаблонов


app.use('/webpack-build', express.static(path.join(__dirname, '../public', 'webpack-build'))); // Статические файлы Webpack
app.use('/static', express.static(path.join(__dirname, 'src', 'public'))); // Статические файлы

app.use(express.json()); // Парсинг JSON тел запросов
app.use(express.urlencoded({extended: true})); // Парсинг URL-кодированных тел запросов

authRouter.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));
authRouter.use(passport.initialize()); // Инициализация Passport
authRouter.use(passport.session()); // Использование сессий Passport

app.use('/', authRouter) // Маршруты аутентификации
app.use('/friends', friendsRouter) // Маршруты управления друзьями
app.use('/im', imRouter) // Маршруты мгновенных сообщений
app.use('/feed', feedRouter) // Маршруты ленты новостей
/**
 * Корневой маршрут - перенаправление на /feed
 */
app.get('/', (req: Request, res: Response): void => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        res.redirect('/feed');
    }
});

const options = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'social_network.key')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'social_network.crt'))
};

const server: Server<typeof http.IncomingMessage, typeof http.ServerResponse> = https.createServer(options, app);


server.listen(port, host, (): void => {
    console.log(`Server is running at https://${host}:${port.toString()}`);
});

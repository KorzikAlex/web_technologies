/**
 * @file server.ts
 * @fileOverview Express сервер
 * @module server
 */
import express, {type Express, type Request, type Response} from "express";
import fs from "fs";
import https, {Server}  from "node:https";
import http from "node:http";
import path from "node:path";

import {router as usersRouter} from "./routes/users.js";
import {router as postsRouter} from "./routes/posts.js";
import {router as friendsRouter} from "./routes/friends.js";

const app: Express = express(); // Создаем экземпляр Express приложения

const host: string = 'localhost'; // Хост сервера
const port: number = parseInt(process.env.PORT ?? '3000', 10); // Порт сервера

const __dirname: string = path.resolve(import.meta.dirname); // Получаем текущую директорию

app.set('view engine', 'pug'); // Устанавливаем Pug в качестве шаблонизатора
app.set('views', path.join(__dirname, './views')); // Указываем директорию для шаблонов

// Статические файлы для обеих сборок (Webpack - основная, Gulp - демонстрационная)
app.use('/webpack-build', express.static(path.join(__dirname, '../public', 'webpack-build')));// Webpack сборка (используется Pug шаблонами)
app.use('/public', express.static(path.join(__dirname, 'src', 'public'))); // Исходные статические файлы
app.use('/gulp-build', express.static(path.join(__dirname, '../public', 'gulp-build'))); // Gulp сборка (статические HTML)

app.use(express.json()); // Парсинг JSON тел запросов
app.use(express.urlencoded({extended: true})); // Парсинг URL-кодированных тел запросов

app.use('/users', usersRouter); // Маршруты для пользователей
app.use('/posts', postsRouter); // Маршруты для постов
app.use('/users/:userId/friends', friendsRouter); // Маршруты для друзей

app.get('/', (req: Request, res: Response): void => {
    res.render('index'); // Страница с объяснением двух сборок
});

const options = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'social_network.key')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'social_network.crt'))
}; // Опции для HTTPS сервера

const server: Server<typeof http.IncomingMessage, typeof http.ServerResponse> = https.createServer(options, app);

server.listen(port, host, (): void => {
    console.log(`Server is running at https://${host}:${port.toString()}`);
});

/**
 * @file server.ts
 * @fileoverview Основной файл сервера Express для социальной сети
 * @module server
 */
import express, { type Express } from "express";
import path from "node:path";
import fs from "node:fs";
import https, { type Server } from "node:https";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { router as postsRouter } from './routes/posts.js';
import { router as usersRouter } from './routes/users.js';
import { router as friendsRouter } from './routes/friends.js';
import { router as postsPageRouter } from './routes/posts-page.js';
import { router as authRouter } from './routes/auth.js';
import cors from 'cors';

const __filename: string = fileURLToPath(import.meta.url); // Получение имени текущего файла
const __dirname: string = path.dirname(__filename); // Получение директории текущего файла

const app: Express = express(); // Создание экземпляра приложения Express

const host: string = process.env.HOST || "localhost"; // Получение хоста из переменных окружения или использование localhost
const port: number = parseInt(process.env.PORT || "3000", 10); // Получение порта из переменных окружения или использование 3000

export const staticPath = path.join(__dirname, '..', '..', 'dist', 'client');

app.use(express.static(staticPath));

app.use(cors()); // Включение CORS для всех маршрутов
app.use(express.json()); // Middleware для парсинга JSON в теле запросов
app.use(express.urlencoded({ extended: true })); // Middleware для парсинга URL-кодированных данных

app.use('/auth', authRouter); // Использование роутов авторизации
app.use('/users', usersRouter); // Использование роутов пользователей
app.use('/posts', postsRouter); // Использование роутов постов
app.use('/friends', friendsRouter); // Роут для страницы друзей
app.use('/posts-page', postsPageRouter); // Роут для страницы новостей


// Чтение SSL сертификатов
const options = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'social_network.key')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'social_network.crt'))
};

// Создание HTTPS сервера
const server: Server<typeof http.IncomingMessage, typeof http.ServerResponse> = https.createServer(options, app);

// Запуск сервера
server.listen(port, host, (): void => {
    console.log(`Server is running at https://${host}:${port}`);
});
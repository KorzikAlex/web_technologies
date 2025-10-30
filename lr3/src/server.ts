/**
 * @file server.ts
 * @fileOverview Express сервер
 * @author KorzikAlex
 * @version 1.0
 * @license MIT
 * @module server
 */
import express, {type Express} from "express";
import path from "node:path";
import type {Server} from "node:net";

import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";

const app: Express = express(); // Создаем экземпляр Express приложения

const host: string = 'localhost'; // Хост сервера
const port: number = parseInt(process.env.PORT || '3000', 10); // Порт сервера

const __dirname: string = path.resolve(import.meta.dirname); // Получаем текущую директорию

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));

app.use('/static', express.static(path.join(__dirname, '../public')));
app.use('/bootstrap', express.static(path.join(__dirname, '../node_modules/bootstrap/dist')));

const server: Server = app.listen(port, host);
server.on('listening', (): void => {
    console.log(`Server is running at http://${host}:${port}`);
});

document.querySelectorAll('[data-bs-toggle="popover"]')
    .forEach(popover => {
        new bootstrap.Popover(popover)
    })
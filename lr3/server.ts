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

const app: Express = express(); // Создаем экземпляр Express приложения

const host: string = 'localhost'; // Хост сервера
const port: number = parseInt(process.env.PORT || '3000', 10); // Порт сервера

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../src/views'));


const server: Server = app.listen(port, host);
server.on('listening', (): void => {
    console.log(`Server is running at http://${host}:${port}`);
});
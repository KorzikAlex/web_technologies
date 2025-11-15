import express, {type Express} from "express";
import path from "node:path";
import fs from "node:fs";
import https, {type Server} from "node:https";
import http from "node:http";
import {fileURLToPath} from "node:url";
import {router as postsRouter} from './routes/posts.js';
import {router as usersRouter} from './routes/users.js';
import cors from 'cors';

const app: Express = express();

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

const host: string = process.env.HOST || "localhost";
const port: number = parseInt(process.env.PORT || "3000", 10);

app.use(cors()); // Enable CORS for all routes
app.use('/users', usersRouter);
app.use('/posts', postsRouter);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const options = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'social_network.key')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'social_network.crt'))
};

const server: Server<typeof http.IncomingMessage, typeof http.ServerResponse> = https.createServer(options, app);

server.listen(port, host, (): void => {
    console.log(`Server is running at https://${host}:${port}`);
});
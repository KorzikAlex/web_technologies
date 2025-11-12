import express, {type Express} from "express";
import path from "node:path";
import fs from "node:fs";
import https, {type Server} from "node:https";
import http from "node:http";

const app: Express = express();

const __pathname: string = import.meta.url;
const __filename: string = path.basename(__pathname);
const __dirname: string = path.dirname(__pathname);

const host: string = process.env.HOST || "localhost";
const port: number = parseInt(process.env.PORT || "3000", 10);

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
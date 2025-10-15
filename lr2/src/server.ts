import express, {type Express, type Request, type Response} from 'express';
import session from 'express-session'
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import indexRouter from './routes/index';
import authRouter from './routes/auth'

import logger from 'morgan';
import passport from 'passport';

import connectSqlite3 from 'connect-sqlite3';

const SQLiteStore= connectSqlite3(session);

const app: Express = express();
const port: string | 3000 = process.env.PORT || 3000;

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

// Настройка шаблонизатора Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const projectRoot: string = path.resolve(__dirname, '..');

app.use(express.static(path.join(projectRoot, 'public')));

app.use(
    '/vendor/fontawesome/css',
    express.static(path.join(projectRoot, 'node_modules', '@fortawesome', 'fontawesome-free', 'css'))
);
app.use(
    '/vendor/fontawesome/webfonts',
    express.static(path.join(projectRoot, 'node_modules', '@fortawesome', 'fontawesome-free', 'webfonts'))
);

app.use('/', indexRouter);
app.use('/', authRouter);

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' }) as any
}));
app.use(passport.authenticate('session'));


app.listen(port, (): void => console.log(`Listening ${port}`));

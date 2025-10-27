/**
 * @file auth.ts
 * @fileOverview Маршруты и логика аутентификации пользователей.
 * @author KorzikAlex
 * @version 1.0
 * @license MIT
 * @module routes/auth
 */
import express, {type NextFunction, type Request, type Response, type Router} from 'express';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {UserManager} from '../domain/UserManager.js';
import type {User, UserRole} from '../models/User.js';

const router: Router = express.Router();
const userManager = new UserManager();

/**
 * Настройка локальной стратегии аутентификации Passport.
 * @function
 * @param {string} username - Имя пользователя
 * @param {string} password - Пароль
 * @param {Function} cb - Callback функция
 */
passport.use(
    new LocalStrategy(async (username: string, password: string, cb) => {
        try {
            const user = await userManager.verifyPassword(username, password);
            if (!user) {
                return cb(null, false, {message: 'Неверное имя пользователя или пароль.'});
            }
            return cb(null, user);
        } catch (err) {
            return cb(err);
        }
    })
);

/**
 * Сериализация пользователя для сохранения в сессии.
 * @function
 * @param {Express.User} user - Объект пользователя
 * @param {Function} cb - Callback функция
 * @returns {void}
 */
passport.serializeUser((user: Express.User, cb): void => {
    process.nextTick(() => {
        cb(null, {
            id: (user as User).id
        });
    });
});

/**
 * Десериализация пользователя из сессии по ID.
 * @function
 * @param {number} id - ID пользователя
 * @param {Function} cb - Callback функция
 * @returns {Promise<void>}
 */
passport.deserializeUser(async (id: number, cb) => {
    try {
        const user: User | undefined = await userManager.findUserById(id);
        cb(null, user ?? false);
    } catch (error) {
        cb(error);
    }
});

/**
 * Middleware для проверки аутентификации пользователя.
 * @function ensureAuthenticated
 * @param {Request} req - Объект запроса Express
 * @param {Response} res - Объект ответа Express
 * @param {NextFunction} next - Функция следующего middleware
 * @returns {void}
 */
export function ensureAuthenticated(req: Request, res: Response, next: NextFunction): void {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
}

/**
 * Middleware для проверки роли пользователя.
 * @function ensureRole
 * @param {UserRole} role - Требуемая роль пользователя
 * @returns {Function} Middleware функция
 */
export function ensureRole(role: UserRole) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || (req.user as User).role !== role) {
            res.status(403).send('Доступ запрещен');
            return;
        }
        next();
    };
}


/**
 * GET /auth/login - Страница входа в систему.
 * @function
 * @param {Request} req - Объект запроса
 * @param {Response} res - Объект ответа
 */
router.get('/login', (req: Request, res: Response) => {
    res.render('login', {title: 'Вход', error: req.flash('error')});
});

/**
 * POST /auth/login/password - Обработка формы входа.
 * @function
 */
router.post(
    '/login/password',
    passport.authenticate('local', {
        successRedirect: '/books',
        failureRedirect: '/auth/login',
        failureFlash: true,
    })
);

/**
 * POST /auth/logout - Выход из системы.
 * @function
 * @param {Request} req - Объект запроса
 * @param {Response} res - Объект ответа
 * @param {NextFunction} next - Функция следующего middleware
 */
router.post('/logout', (req: Request, res: Response, next: NextFunction): void => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/');
    });
});

/**
 * GET /auth/signup - Страница регистрации.
 * @name GET/auth/signup
 * @function
 * @param {Request} req - Объект запроса
 * @param {Response} res - Объект ответа
 */
router.get('/signup', (req: Request, res: Response) => {
    res.render('signup', {title: 'Регистрация', error: req.flash('error')});
});

/**
 * POST /auth/signup - Обработка формы регистрации.
 * @name POST/auth/signup
 * @function
 * @param {Request} req - Объект запроса
 * @param {Response} res - Объект ответа
 * @param {NextFunction} next - Функция следующего middleware
 */
router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {username, email, password} = req.body;

        if (!username || !password) {
            req.flash('error', 'Имя пользователя и пароль обязательны');
            return res.redirect('/auth/signup');
        }

        const user: User = await userManager.createUser({
            username,
            email,
            password,
        });

        req.login(user, err => {
            if (err) return next(err);
            res.redirect('/books');
        });
    } catch (error: any) {
        req.flash('error', error.message);
        res.redirect('/auth/signup');
    }
});

export default router;

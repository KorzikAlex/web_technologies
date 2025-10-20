/**
 * @file auth.ts
 * @fileOverview Маршруты и логика аутентификации пользователей.
 * @author KorzikAlex
 * @version 1.0
 * @license MIT
 * @module routes/auth
 */
import express, { type NextFunction, type Request, type Response, type Router } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { UserManager } from '../../domain/UserManager.ts';
import type { User, UserRole } from '../../data/models/User.ts';

const router: Router = express.Router(); // Создаем роутер для аутентификации
const userManager = new UserManager(); // Экземпляр менеджера пользователей

/**
 * Настройка стратегии локальной аутентификации.
 */
passport.use(
    new LocalStrategy(async (username: string, password: string, done): Promise<void> => {
        try {
            const user: User | null = await userManager.verifyPassword(username, password);
            if (!user) {
                return done(null, false, { message: 'Неверный логин или пароль' });
            }
            return done(null, user);
        } catch (err) {
            return done(err as Error);
        }
    })
);

/**
 * Сериализация пользователя в сессию.
 */
passport.serializeUser((user: Express.User, cb): void => {
    cb(null, (user as User).id);
});

/**
 * Десериализация пользователя по ID.
 */
passport.deserializeUser(async (id: number, cb) => {
    try {
        const user = await userManager.findUserById(id);
        cb(null, user ?? false);
    } catch (error) {
        cb(error);
    }
});

/**
 * GET /auth/login
 */
router.get('/login', (req: Request, res: Response): void => {
    const error = req.query.error as string | undefined;
    console.log('Error from query:', error); // ← отладка
    res.render('login', {
        title: 'Вход в библиотеку',
        error: error || null
    });
});

/**
 * POST /auth/login/password
 */
router.post('/login/password', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: Error | null, user: Express.User | false, info: any) => {
        if (err) return next(err);

        if (!user) {
            // Вместо flash используем query-параметр
            return res.redirect('/auth/login?error=' + encodeURIComponent(info?.message || 'Ошибка входа'));
        }

        req.logIn(user, (loginErr) => {
            if (loginErr) return next(loginErr);
            return res.redirect('/books');
        });
    })(req, res, next);
});

/**
 * GET /auth/signup
 * Страница регистрации нового пользователя.
 */
router.get('/signup', async (req: Request, res: Response) => {
    const hasUsers = await userManager.hasUsers();
    res.render('signup', {
        title: 'Регистрация',
        hint: hasUsers ? 'Новый пользователь получит роль читателя' : 'Первый пользователь станет администратором',
    });
});

/**
 * POST /auth/signup
 * Регистрация нового пользователя.
 */
router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password, name } = req.body;
        const user = await userManager.createUser({
            username: username?.trim(),
            email: email?.trim(),
            password,
        });

        req.login(user, err => {
            if (err) return next(err);
            res.redirect('/books');
        });
    } catch (err: any) {
        res.status(400).render('signup', {
            title: 'Регистрация',
            error: err.message,
        });
    }
});

/**
 * POST /auth/logout
 * Выход пользователя из системы.
 */
router.post('/logout', (req: Request, res: Response, next: NextFunction): void => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/auth/login');
    });
});

/**
 * Проверяет, аутентифицирован ли пользователь.
 * @param req - Request
 * @param res - Response
 * @param next - NextFunction
 */
export function ensureAuthenticated(req: Request, res: Response, next: NextFunction): void {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/login');
}

/**
 * Проверяет, что у пользователя есть необходимая роль.
 * @param role - требуемая роль пользователя
 */
export function ensureRole(role: UserRole) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = req.user as User | undefined;
        if (user?.role === role) return next();
        res.status(403).send('Доступ запрещён');
    };
}

export default router; // Экспортируем роутер аутентификации

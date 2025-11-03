import express, {type NextFunction, type Request, type Response, type Router} from 'express';
import passport from 'passport';
import {type IVerifyOptions, Strategy as LocalStrategy} from 'passport-local';
import {userManager} from '../domain/UserManager';
import type {User, UserRole} from '../models/User';

export const authRouter: Router = express.Router();


authRouter.use(express.urlencoded({extended: true}));


/**
 * Настройка стратегии локальной аутентификации
 */
passport.use(
    new LocalStrategy(async (
        username: string, password: string,
        done: (error: any, user?: (Express.User | false), options?: IVerifyOptions) => void
    ): Promise<void> => {
        try {
            const user: User | null = await userManager.verifyPassword(username, password);
            if (!user) {
                done(null, false, {message: 'Неверный логин или пароль'});
                return;
            }
            done(null, user);
        } catch (err) {
            done(err as Error);
        }
    })
);

/**
 * Сериализация пользователя
 */
passport.serializeUser((user: Express.User, cb: (err: any, id?: unknown) => void): void => {
    cb(null, (user as User).id);
});

/**
 * Десериализация пользователя
 */
passport.deserializeUser(async (
    id: number, cb: (err: any, user?: (Express.User | false | null)) => void
): Promise<void> => {
    try {
        const user: User | null = await userManager.findUserById(id);
        cb(null, user ?? false);
    } catch (error) {
        cb(error);
    }
});

/**
 * Страница входа
 */
authRouter.get('/login', (req: Request, res: Response): void => {
    res.render('login', {error: req.query.error});
});

/**
 * Обработка входа
 */
authRouter.post('/login', passport.authenticate('local', {
    successRedirect: '/feed',
    failureRedirect: '/login?error=1'
}));

/**
 * Страница регистрации нового пользователя
 */
authRouter.get('/signup', (req: Request, res: Response): void => {
    res.render('signup', {error: req.query.error});
});

/**
 * Обработка регистрации нового пользователя
 */
authRouter.post('/signup', async (req: Request, res: Response): Promise<void> => {
    try {
        const {username, email, password} = req.body as {
            username: string; email: string; password: string
        };
        await userManager.createUser(username, email, password);
        res.redirect('/login');
    } catch {
        res.redirect('/signup?error=1');
    }
});

/**
 * Обработка выхода из системы
 */
authRouter.get('/logout', (req: Request, res: Response): void => {
    req.logout((): void => {
        res.redirect('/login');
    });
});

/**
 * Проверка аутентификации пользователя
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @return void
 */
export function ensureAuthenticated(req: Request, res: Response, next: NextFunction): void {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

/**
 * Проверка роли пользователя
 * @param role Роль пользователя
 * @returns Middleware функция
 */
export function ensureRole(role: UserRole): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = req.user as User | undefined;
        if (user?.role === role) {
            return next();
        }
        res.status(403).send('Доступ запрещён');
    };
}

export default authRouter;

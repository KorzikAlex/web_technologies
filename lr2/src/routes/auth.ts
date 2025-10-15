import express, {type NextFunction, type Request, type Response, type Router} from 'express';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import crypto from 'crypto';
import db from '../../db';

const authRouter: Router = express.Router();

// Маршрут для страницы входа
authRouter.get('/login', (req: Request, res: Response, next: NextFunction): void => {
    res.render('login');
});

passport.use(new LocalStrategy((username: any, password: any, cb: any): void => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err: any, row: any): any => {
        if (err) {
            return cb(err);
        }
        if (!row) {
            return cb(null, false, {message: 'Incorrect username or password.'});
        }

        crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', (err, hashedPassword): any => {
            if (err) {
                return cb(err);
            }
            if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
                return cb(null, false, {message: 'Incorrect username or password.'});
            }
            return cb(null, row);
        });
    });
}));

authRouter.post('/login/password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

passport.serializeUser((user, cb): void => {
    process.nextTick((): void => {
        cb(null, {id: user.id, username: user.username});
    });
});

passport.deserializeUser((user, cb): void => {
    process.nextTick((): void => {
        return cb(null, user);
    });
});

authRouter.post('/logout', (req: Request, res: Response, next: NextFunction): void => {
    req.logout((err: any): void => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

authRouter.get('/signup', (req: Request, res: Response, next: NextFunction): void => {
    res.render('signup');
});

authRouter.post('/signup', (req: Request, res: Response, next: NextFunction): void => {
    const salt: Buffer = crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', (err: Error | null, hashedPassword: Buffer<ArrayBufferLike>): void => {
        if (err) {
            return next(err);
        }
        db.run('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
            req.body.username,
            hashedPassword,
            salt
        ], (err: any): void => {
            if (err) {
                return next(err);
            }
            const user = {
                id: this.lastID,
                username: req.body.username
            };
            req.login(user, err => {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });
});

export default authRouter;
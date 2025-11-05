import express, {Router, Request, Response} from 'express';
import {userManager} from '../domain/UserManager';
import {User} from "../models/User";

export const router: Router = express.Router();

// Страница управления пользователями
router.get('/', (_req: Request, res: Response): void => {
    res.render('users');
});

// API для получения всех пользователей
router.get('/api/users', (_req: Request, res: Response): void => {
    const users: Promise<User[]> = userManager.getAllUsers();
    res.json(users);
});

// API для получения одного пользователя
router.get('/api/users/:id', (req: Request, res: Response): void => {
    const user: Promise<User> = userManager.getUserById(parseInt(req.params.id, 10));
    if (!user) {
        res.status(404).json({error: 'Пользователь не найден'});
        return;
    }
    res.json(user);
});

// API для обновления пользователя
router.put('/api/users/:id', (req: Request, res: Response): void => {
    const updated = userManager.updateUser(Number(req.params.id), req.body);
    if (!updated) {
        res.status(404).json({error: 'Пользователь не найден'});
        return;
    }
    res.json(updated);
});

// API для создания пользователя
router.post('/api/users', async (req: Request, res: Response): Promise<void> => {
    try {
        const {username, email, password, fullName, birthDate} = req.body;
        const newUser: User = await userManager.createUser(username, email, password, fullName, birthDate);
        res.status(201).json(newUser);
    } catch {
        res.status(500).json({error: 'Ошибка создания пользователя'});
    }
});

// API для удаления пользователя
router.delete('/api/users/:id', (req: Request, res: Response): void => {
    const deleted: Promise<boolean> = userManager.deleteUser(Number(req.params.id));
    if (!deleted) {
        res.status(404).json({error: 'Пользователь не найден'});
        return;
    }
    res.status(204).send();
});






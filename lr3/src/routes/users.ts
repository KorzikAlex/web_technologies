import express, {Router, Request, Response} from 'express';
import {userManager} from '../domain/UserManager';
import {User} from "../models/User";

export const router: Router = express.Router();

// Страница управления пользователями
router.get('/', (_req: Request, res: Response): void => {
    res.render('users');
});

// API для получения всех пользователей
router.get('/api/users', async (_req: Request, res: Response): Promise<void> => {
    try {
        const users: User[] = await userManager.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        res.status(500).json({error: 'Не удалось получить список пользователей'});
    }
});

// API для получения одного пользователя
router.get('/api/users/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const user: User | null = await userManager.getUserById(parseInt(req.params.id, 10));
        if (!user) {
            res.status(404).json({error: 'Пользователь не найден'});
            return;
        }
        res.json(user);
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({error: 'Не удалось получить данные пользователя'});
    }
});

// API для обновления пользователя
router.put('/api/users/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const updated: User | null = await userManager.updateUser(Number(req.params.id), req.body);
        if (!updated) {
            res.status(404).json({error: 'Пользователь не найден'});
            return;
        }
        res.json(updated);
    } catch (error) {
        console.error('Ошибка обновления пользователя:', error);
        res.status(500).json({error: 'Не удалось обновить пользователя'});
    }
});

// API для создания пользователя
router.post('/api/users', async (req: Request, res: Response): Promise<void> => {
    try {
        const {username, email, password, fullName, birthDate} = req.body;
        const newUser: User = await userManager.createUser(username, email, password, fullName, birthDate);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Ошибка создания пользователя:', error);
        res.status(500).json({error: 'Ошибка создания пользователя'});
    }
});

// API для удаления пользователя
router.delete('/api/users/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const deleted: boolean = await userManager.deleteUser(Number(req.params.id));
        if (!deleted) {
            res.status(404).json({error: 'Пользователь не найден'});
            return;
        }
        res.status(204).send();
    } catch (error) {
        console.error('Ошибка удаления пользователя:', error);
        res.status(500).json({error: 'Не удалось удалить пользователя'});
    }
});

export default router;

import express, {Router, Request, Response} from 'express';
import {userManager} from '../domain/UserManager';
import {User} from "../models/User";

export const router: Router = express.Router();

// Страница "Мои друзья"
router.get('/', async (_req: Request, res: Response): Promise<void> => {
    try {
        // Для рендера на сервере можно передать друзей сразу
        const friends = await userManager.getFriends(1); // Предполагаем ID текущего пользователя = 1
        res.render('friends', {friends});
    } catch (error) {
        console.error(error);
        res.status(500).render('friends', {friends: [], error: 'Не удалось загрузить друзей'});
    }
});

// API для получения списка друзей
router.get('/api/friends', async (_req: Request, res: Response): Promise<void> => {
    try {
        // Предполагаем, что работаем с друзьями пользователя с ID=1 (администратора)
        const friends: User[] = await userManager.getFriends(1);
        res.json(friends);
    } catch (error) {
        res.status(500).json({error: 'Ошибка получения списка друзей'});
    }
});

// API для удаления друга
router.delete('/api/friends/:friendId', async (req: Request, res: Response): Promise<void> => {
    try {
        const friendId = parseInt(req.params.friendId, 10);
        // Предполагаем, что удаляем друга у пользователя с ID=1
        const success = await userManager.removeFriend(1, friendId);
        if (success) {
            res.status(204).send();
        } else {
            res.status(404).json({error: 'Друг не найден'});
        }
    } catch (error) {
        res.status(500).json({error: 'Ошибка удаления друга'});
    }
});

export default router;

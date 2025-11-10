import express, {Router, Request, Response} from 'express';
import {userManager} from '../domain/UserManager.js';
import {User} from "../models/User.js";

export const router: Router = express.Router({mergeParams: true}); // mergeParams для доступа к :userId

// Страница "Мои друзья" для конкретного пользователя
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const user = await userManager.getUserById(userId);
        if (!user) {
            res.status(404).send('Пользователь не найден');
            return;
        }
        const friends = await userManager.getFriends(userId);

        // Формируем fullName из раздельных полей
        const fullName = user.patronymic
            ? `${user.surname} ${user.name} ${user.patronymic}`
            : `${user.surname} ${user.name}`;

        res.render('friends', {
            friends,
            currentUser: user,
            pageTitle: `Друзья ${fullName}`,
            activeLink: 'users'
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('friends', {
            friends: [],
            currentUser: null,
            error: 'Не удалось загрузить друзей'
        });
    }
});

// API для получения списка друзей пользователя
router.get('/api/friends', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const friends: User[] = await userManager.getFriends(userId);
        res.json(friends);
    } catch (error) {
        res.status(500).json({error: 'Ошибка получения списка друзей'});
    }
});

// API для получения всех пользователей (для модального окна добавления)
router.get('/api/all-users', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const allUsers = await userManager.getAllUsers();
        const user = await userManager.getUserById(userId);
        const friends = await userManager.getFriends(userId);
        const friendIds = new Set(friends.map(f => f.id));

        // Фильтруем, чтобы не показывать текущего пользователя и уже добавленных друзей
        const usersToAdd = allUsers.filter(u => u.id !== userId && !friendIds.has(u.id));
        res.json(usersToAdd);
    } catch (error) {
        res.status(500).json({error: 'Ошибка получения списка пользователей'});
    }
});


// API для добавления друга
router.post('/api/friends', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const {friendId} = req.body;
        if (!friendId) {
            res.status(400).json({error: 'Не указан ID друга'});
            return;
        }
        const success = await userManager.addFriend(userId, parseInt(friendId, 10));
        if (success) {
            res.status(201).json({message: 'Друг успешно добавлен'});
        } else {
            res.status(404).json({error: 'Не удалось добавить друга'});
        }
    } catch (error) {
        res.status(500).json({error: 'Ошибка добавления друга'});
    }
});


// API для удаления друга
router.delete('/api/friends/:friendId', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const friendId = parseInt(req.params.friendId, 10);
        const success = await userManager.removeFriend(userId, friendId);
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

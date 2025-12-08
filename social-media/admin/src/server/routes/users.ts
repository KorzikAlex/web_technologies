/**
 * @file users.ts
 * @fileoverview Роуты для работы с пользователями: создание, получение, обновление и удаление пользователей
 * @module usersRoutes
 */
import express, {type Router} from 'express';
import {userManager} from "../managers/UserManager.js";
import {postsManager} from "../managers/PostsManager.js";
import type {User} from "../../shared/models/User.js";

export const router: Router = express.Router(); // Создание роутера для пользователей

/**
 * Получение пользователя по ID
 */
router.get('/:id', async (req, res) => {
    const userId: number = Number(req.params.id);
    const user: User | null = await userManager.getUserById(userId);

    if (!user) {
        return res.status(404).json({message: 'User not found'});
    }
    res.json(user);
});

/**
 * Обновление пользователя по ID
 */
router.post('/:id', async (req, res) => {
    const userId: number = Number(req.params.id);
    const updates: Partial<User> = req.body;

    try {
        await userManager.updateUser(userId, updates);
        res.json({message: 'User updated successfully'});
    } catch {
        res.status(404).json({message: 'User not found'});
    }
})

/**
 * Удаление пользователя по ID
 */
router.delete('/:id', async (req, res) => {
    const userId: number = Number(req.params.id);

    // Сначала удаляем все посты пользователя
    await postsManager.deletePostsByAuthorId(String(userId));

    const success: boolean = await userManager.deleteUser(userId);

    if (!success) {
        return res.status(404).json({message: 'User not found'});
    }
    res.json({message: 'User deleted successfully'});
});

/**
 * Получение всех пользователей
 */
router.get('/', async (req, res) => {
    const idsParam = req.query.ids as string | undefined;
    const users: User[] = await userManager.getAllUsers();

    if (idsParam) {
        const ids = idsParam.split(',').map(s => Number(s)).filter(n => !isNaN(n));
        return res.json(users.filter(u => ids.includes(u.id)));
    }

    res.json(users);
});

/**
 * Создание нового пользователя
 */
router.post('/', async (req, res) => {
    try {
        const newUser = await userManager.createUser(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
});

/**
 * Получение друзей пользователя
 */
router.get('/:id/friends', async (req, res) => {
    const userId: number = Number(req.params.id);
    try {
        const friends = await userManager.getFriends(userId);
        res.json(friends);
    } catch (error) {
        res.status(404).json({ message: (error as Error).message });
    }
});

/**
 * Добавление друга пользователю
 */
router.post('/:id/friends/:friendId', async (req, res) => {
    const userId: number = Number(req.params.id);
    const friendId: number = Number(req.params.friendId);
    try {
        await userManager.addFriend(userId, friendId);
        res.json({ message: 'Друг добавлен успешно' });
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
});

/**
 * Удаление друга у пользователя
 */
router.delete('/:id/friends/:friendId', async (req, res) => {
    const userId: number = Number(req.params.id);
    const friendId: number = Number(req.params.friendId);
    try {
        await userManager.removeFriend(userId, friendId);
        res.json({ message: 'Друг удален успешно' });
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
});


export default router; // Экспорт роутера пользователей
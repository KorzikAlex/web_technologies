/**
 * @file auth.ts
 * @fileoverview Роуты для авторизации и регистрации пользователей
 * @module authRoutes
 */
import express, { type Router, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { userManager } from '../managers/UserManager.js';
import type { User } from '../../shared/models/User.js';

export const router: Router = express.Router();

// Секретный ключ для JWT (в production должен быть в переменных окружения)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Авторизация пользователя
 * POST /auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Необходимо указать username и password' });
        }

        // Находим пользователя по username
        const user: User | null = await userManager.getUserByUsername(username);

        if (!user) {
            return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
        }

        // Проверяем пароль
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
        }

        // Создаем JWT токен
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Возвращаем токен и информацию о пользователе (включая дату рождения)
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                name: user.name,
                surname: user.surname,
                patronymic: user.patronymic,
                avatarPath: user.avatarPath,
                birthDate: user.birthday ? (new Date(user.birthday)).toISOString() : undefined,
            }
        });
    } catch (error) {
        console.error('Ошибка при авторизации:', error);
        res.status(500).json({ message: 'Ошибка сервера при авторизации' });
    }
});

/**
 * Регистрация нового пользователя
 * POST /auth/signup
 */
router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { username, email, password, name, surname, patronymic, birthday } = req.body;

        // Валидация обязательных полей
        if (!username || !email || !password || !name || !surname || !birthday) {
            return res.status(400).json({
                message: 'Необходимо заполнить все обязательные поля'
            });
        }

        // Проверяем, не существует ли уже пользователь с таким username
        const existingUserByUsername = await userManager.getUserByUsername(username);
        if (existingUserByUsername) {
            return res.status(409).json({ message: 'Пользователь с таким именем уже существует' });
        }

        // Проверяем, не существует ли уже пользователь с таким email
        const existingUserByEmail = await userManager.getUserByEmail(email);
        if (existingUserByEmail) {
            return res.status(409).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Хешируем пароль
        const passwordHash = await bcrypt.hash(password, 10);

        // Создаем нового пользователя
        const newUser = await userManager.createUser({
            username,
            email,
            passwordHash,
            name,
            surname,
            patronymic: patronymic || '',
            birthday: new Date(birthday),
            avatarPath: '',
            role: 'user',
            updatedAt: new Date(),
        });

        // Создаем JWT токен
        const token = jwt.sign(
            {
                userId: newUser.id,
                username: newUser.username,
                role: newUser.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Возвращаем токен и информацию о пользователе (включая дату рождения)
        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                name: newUser.name,
                surname: newUser.surname,
                patronymic: newUser.patronymic,
                avatarPath: newUser.avatarPath,
                birthDate: newUser.birthday ? (new Date(newUser.birthday)).toISOString() : undefined,
            }
        });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера при регистрации' });
    }
});

/**
 * Проверка токена и получение информации о текущем пользователе
 * GET /auth/me
 */
router.get('/me', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Токен не предоставлен' });
        }

        const token = authHeader.substring(7);

        // Проверяем и декодируем токен
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string; role: string };

        // Получаем актуальную информацию о пользователе
        const user = await userManager.getUserById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            name: user.name,
            surname: user.surname,
            patronymic: user.patronymic,
            avatarPath: user.avatarPath,
            birthDate: user.birthday ? (new Date(user.birthday)).toISOString() : undefined,
        });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Неверный токен' });
        }
        console.error('Ошибка при проверке токена:', error);
        res.status(500).json({ message: 'Ошибка сервера при проверке токена' });
    }
});

export default router;

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import type {User, UserRole, UserStatus} from '../models/User';
import {fileURLToPath} from "node:url";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

/**
 * Класс для управления пользователями
 * @class UserManager
 */
export class UserManager {
    /**
     * Путь к файлу с данными пользователей
     * @private
     */
    private readonly dataPath: string = path.resolve(__dirname, '../data/', 'users.json');

    /**
     * Загрузка пользователей из файла
     * @private
     * @returns {Promise<User[]>} Массив пользователей
     */
    private async loadUsers(): Promise<User[]> {
        try {
            const data: string = await fs.readFile(this.dataPath, 'utf-8'); // Чтение файла с пользователями
            return JSON.parse(data); // Парсинг JSON данных
        } catch {
            return []; // Возвращаем пустой массив, если файл не найден или произошла ошибка
        }
    }

    /**
     * Сохранение пользователей в файл
     * @param users Массив пользователей для сохранения
     * @private
     */
    private async saveUsers(users: User[]): Promise<void> {
        // Сохранение пользователей в файл
        await fs.writeFile(this.dataPath, JSON.stringify(users, null, 4), 'utf-8');
    }

    /**
     * Хеширование пароля с использованием соли
     * @param password Пароль для хеширования
     * @param salt Соль для хеширования
     * @private
     * @returns {string} Хешированный пароль
     */
    private hashPassword(password: string, salt: string): string {
        // Хеширование пароля с использованием PBKDF2
        return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    }

    /**
     * Создание нового пользователя
     * @param username - имя пользователя
     * @param email - email пользователя
     * @param password - пароль пользователя
     * @param fullName - полное имя пользователя
     * @param birthDate - дата рождения пользователя
     * @returns {Promise<User>} Созданный пользователь
     */
    async createUser(
        username: string,
        email: string,
        password: string,
        fullName: string,
        birthDate: string
    ): Promise<User> {
        const users: User[] = await this.loadUsers();
        const salt: string = crypto.randomBytes(16).toString('hex');
        const passwordHash: string = this.hashPassword(password, salt);

        const newUser: User = {
            id: users.length > 0 ? Math.max(...users.map((u: User): number => u.id)) + 1 : 1,
            username,
            email,
            passwordHash,
            salt,
            fullName,
            birthDate,
            status: 'active', // Автоматически активируем
            friends: [],
            messages: {},
            feed: [],
            role: (users.length === 0) ? "admin" : "user"
        };

        users.push(newUser);
        await this.saveUsers(users);
        return newUser;
    }

    /**
     * Проверка пароля для конкретного пользователя
     */
    async verifyPasswordForUser(user: User, password: string): Promise<boolean> {
        const hash: string = this.hashPassword(password, user.salt);
        return hash === user.passwordHash;
    }

    /**
     * Проверка пароля пользователя
     * @param usernameOrEmail имя пользователя или email
     * @param password пароль для проверки
     * @returns {Promise<User | null>} Пользователь, если пароль верен, иначе null
     */
    async verifyPassword(usernameOrEmail: string, password: string): Promise<User | null> {
        let user: User | null = await this.getUserByUsername(usernameOrEmail);

        if (!user) {
            user = await this.getUserByEmail(usernameOrEmail);
        }

        if (!user) {
            return null;
        }

        const isValid: boolean = await this.verifyPasswordForUser(user, password);
        return isValid ? user : null;
    }

    /**
     * Поиск пользователя по заданному ключу и значению
     * @param key Ключ для поиска
     * @param value Значение для поиска
     * @private
     * @returns {Promise<User | null>} Пользователь или null, если не найден
     */
    private async getUserBy<K extends keyof User>(
        key: K,
        value: User[K]
    ): Promise<User | null> {
        const users: User[] = await this.loadUsers(); // Загрузка пользователей
        return users.find((u: User): boolean => u[key] === value) ?? null; // Поиск пользователя по ключу и значению
    }

    /**
     * Поиск пользователя по ID
     * @param id
     */
    async getUserById(id: number): Promise<User | null> {
        return this.getUserBy('id', id); // Поиск пользователя по ID
    }

    /**
     * Поиск пользователя по имени пользователя
     * @param username
     * @returns {Promise<User | null>} Пользователь или null, если не найден
     */
    async getUserByUsername(username: string): Promise<User | null> {
        return this.getUserBy('username', username); // Поиск пользователя по имени пользователя
    }

    /**
     * Поиск пользователя по email
     * @param email
     * @returns {Promise<User | null>} Пользователь или null, если не найден
     */
    async getUserByEmail(email: string): Promise<User | null> {
        return this.getUserBy('email', email); // Поиск пользователя по email
    }

    /**
     * Обновление данных пользователя
     * @param id ID пользователя
     * @param updates Объект с обновлениями
     * @returns {Promise<User | null>} Обновленный пользователь или null, если не найден
     */
    async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
        const users: User[] = await this.getAllUsers();
        const index: number = users.findIndex((u: User): boolean => u.id === id);
        if (index === -1) {
            return null;
        }

        users[index] = {...users[index], ...updates};
        await this.saveUsers(users);
        return users[index];
    }

    /**
     * Обновление конкретного поля пользователя
     * @param id ID пользователя
     * @param key Ключ поля для обновления
     * @param value Новое значение поля
     * @returns {Promise<User | null>} Обновленный пользователь или null, если не найден
     * @private
     */
    private async updateUserField<K extends keyof User>(
        id: number,
        key: K,
        value: User[K]
    ): Promise<User | null> {
        return this.updateUser(id, {[key]: value} as Partial<User>);
    }

    /**
     * Обновление роли пользователя
     * @param id
     * @param role
     * @returns {Promise<User | null>} Обновленный пользователь или null, если не найден
     */
    async updateUserRole(id: number, role: UserRole): Promise<User | null> {
        return this.updateUserField(id, 'role', role);
    }

    /**
     * Обновление статуса пользователя
     * @param id ID пользователя
     * @param status Новый статус пользователя
     */
    async updateUserStatus(id: number, status: UserStatus): Promise<User | null> {
        return this.updateUserField(id, 'status', status);
    }

    /**
     * Удаление пользователя по ID
     * @param id ID пользователя
     * @returns {Promise<boolean>} true, если пользователь был удален, иначе false
     */
    async deleteUser(id: number): Promise<boolean> {
        const users: User[] = await this.getAllUsers();
        const filtered: User[] = users.filter((u: User): boolean => u.id !== id);
        if (filtered.length === users.length) {
            return false;
        }
        await this.saveUsers(filtered);
        return true;
    }

    async getAllUsers(): Promise<User[]> {
        return this.loadUsers();
    }

    /**
     * Получение списка друзей пользователя
     * @param userId ID пользователя
     * @returns {Promise<User[]>} Массив друзей
     */
    async getFriends(userId: number): Promise<User[]> {
        const user: User = await this.getUserById(userId);
        if (!user || !user.friends) {
            return [];
        }
        const friends = await Promise.all(
            user.friends.map(friendId => this.getUserById(friendId))
        );
        return friends.filter((f): f is User => f !== null);
    }

    /**
     * Удаление друга
     * @param userId ID пользователя
     * @param friendId ID друга для удаления
     * @returns {Promise<boolean>} true, если друг удален, иначе false
     */
    async removeFriend(userId: number, friendId: number): Promise<boolean> {
        const users: User[] = await this.loadUsers();
        const userIndex: number = users.findIndex((u: User): boolean => u.id === userId);
        const friendIndex: number = users.findIndex((u: User): boolean => u.id === friendId);

        if (userIndex === -1 || friendIndex === -1) {
            return false;
        }

        const user: User = users[userIndex];
        const friend: User = users[friendIndex];

        const userFriendIndex: number = user.friends.indexOf(friendId);
        if (userFriendIndex > -1) {
            user.friends.splice(userFriendIndex, 1);
        }

        const friendUserIndex: number = friend.friends.indexOf(userId);
        if (friendUserIndex > -1) {
            friend.friends.splice(friendUserIndex, 1);
        }

        await this.saveUsers(users);
        return true;
    }
}

export const userManager: UserManager = new UserManager();

/**
 * @file UserManager.ts
 * @fileoverview Менеджер для работы с пользователями: добавление, получение, удаление и обновление пользователей
 * @module UserManager
 */
import path from "node:path";
import type { User } from "../../shared/models/User.js";
import fs from 'fs/promises';
import { fileURLToPath } from "node:url";

const __filename: string = fileURLToPath(import.meta.url); // Получение имени текущего файла
const __dirname: string = path.dirname(__filename); // Получение директории текущего файла

export type UserInfo = Omit<User, 'id' | 'createdAt' | 'status' | 'friends'>; // Тип для информации о пользователе без системных полей

/**
 * Менеджер для работы с пользователями
 * @class UserManager
 */
export class UserManager {
    /**
     * Путь к файлу с данными пользователей
     * @private
     * @readonly
     */
    private readonly dataPath: string = path.resolve(__dirname, '../data/', 'users.json');

    /**
     * Читает и возвращает всех пользователей из файла
     * @private
     * @returns {Promise<User[]>} Массив пользователей
     */
    private async getUsers(): Promise<User[]> {
        try {
            const data: string = await fs.readFile(this.dataPath, 'utf-8'); // Чтение файла с пользователями
            return JSON.parse(data); // Парсинг JSON данных в массив пользователей
        } catch {
            return [];
        }
    }
    /**
     * Сохраняет массив пользователей в файл
     * @private
     * @param users Массив пользователей для сохранения
     * @returns {Promise<void>}
     */
    private async saveUsers(users: User[]): Promise<void> {
        await fs.writeFile(this.dataPath, JSON.stringify(users, null, 4), 'utf-8'); // Сохранение массива пользователей в файл
    }
    /**
     * Создает нового пользователя и сохраняет его в файл
     * @param userInfo Информация о пользователе
     * @returns {Promise<User>} Созданный пользователь
     */
    async createUser(userInfo: UserInfo): Promise<User> {
        const users: User[] = await this.getUsers(); // Получение текущих пользователей

        // Создание нового пользователя с уникальным ID и текущей датой создания
        const newUser: User = {
            id: users.length + 1,
            createdAt: new Date(),
            status: 'unconfirmed',
            friends: [],
            ...userInfo,
        };
        users.push(newUser); // Добавление нового пользователя в массив
        await this.saveUsers(users); // Сохранение обновленного массива пользователей
        return newUser; // Возврат созданного пользователя
    }
    /**
     * Получает пользователя по указанному ключу и значению
     * @private
     * @param key Ключ для поиска пользователя
     * @param value Значение для поиска пользователя
     * @returns {Promise<User | null>} Найденный пользователь или null, если не найден
     */
    private async getUserBy<K extends keyof User>(key: K, value: User[K]): Promise<User | null> {
        const users: User[] = await this.getUsers(); // Получение текущих пользователей
        return users.find((user: User): boolean =>
            user[key] === value
        ) ?? null; // Поиск пользователя по ключу и значению, возврат null если не найден
    }
    /**
     * Получает пользователя по его ID
     * @param id ID пользователя
     * @returns {Promise<User | null>} Найденный пользователь или null, если не найден
     */
    async getUserById(id: number): Promise<User | null> {
        return this.getUserBy('id', id);
    }
    /**
     * Получает пользователя по его email
     * @param email Email пользователя
     * @returns {Promise<User | null>} Найденный пользователь или null, если не найден
     */
    async getUserByEmail(email: string): Promise<User | null> {
        return this.getUserBy('email', email);
    }
    /**
     * Получает пользователя по его имени пользователя (username)
     * @param username Имя пользователя
     * @returns {Promise<User | null>} Найденный пользователь или null, если не найден
     */
    async getUserByUsername(username: string): Promise<User | null> {
        return this.getUserBy('username', username);
    }
    /**
     * Обновляет информацию о пользователе
     * @param id ID пользователя
     * @param updates Обновленные данные пользователя
     */
    async updateUser(id: number, updates: Partial<User>): Promise<void> {
        const users: User[] = await this.getUsers(); // Получение текущих пользователей
        const existingUser: User | undefined = users.find((user: User): boolean =>
            user.id === id
        ); // Поиск существующего пользователя по ID

        // Если пользователь не найден, выбрасывается ошибка
        if (!existingUser) {
            throw new Error('Пользователь не найден');
        }

        // Создание обновленного объекта пользователя с новыми данными
        const updatedUser: User = {
            ...existingUser,
            updatedAt: new Date(),
            ...updates,
        };

        const userIndex: number = users.indexOf(existingUser); // Получение индекса существующего пользователя в массиве
        users[userIndex] = updatedUser; // Обновление пользователя в массиве
        await this.saveUsers(users); // Сохранение обновленного массива пользователей
    }
    /**
     * Удаляет пользователя по его ID
     * @param id ID пользователя
     * @returns {Promise<boolean>} true, если пользователь был удален, иначе false
     */
    async deleteUser(id: number): Promise<boolean> {
        const users: User[] = await this.getUsers(); // Получение текущих пользователей
        const filteredUsers: User[] = users.filter((user: User): boolean =>
            user.id !== id
        ); // Фильтрация пользователей, исключая пользователя с указанным ID

        if (filteredUsers.length === users.length) {
            return false;
        } // Если длина массива не изменилась, пользователь не найден
        await this.saveUsers(filteredUsers); // Сохранение обновленного массива пользователей
        return true;
    }
    /**
     * Получает всех пользователей
     * @returns {Promise<User[]>} Массив всех пользователей
     */
    async getAllUsers(): Promise<User[]> {
        return this.getUsers();
    }
    /**
     * Получает друзей пользователя
     * @param userId ID пользователя
     * @returns {Promise<User[]>} Массив друзей
     */
    async getFriends(userId: number): Promise<User[]> {
        const user = await this.getUserById(userId);
        if (!user) {
            throw new Error('Пользователь не найден');
        }
        const friends: User[] = [];
        for (const friendId of user.friends) {
            const friend = await this.getUserById(friendId);
            if (friend) {
                friends.push(friend);
            }
        }
        return friends;
    }
    /**
     * Добавляет друга пользователю
     * @param userId ID пользователя
     * @param friendId ID друга
     */
    async addFriend(userId: number, friendId: number): Promise<void> {
        if (userId === friendId) {
            throw new Error('Нельзя добавить себя в друзья');
        }
        const user = await this.getUserById(userId);
        const friend = await this.getUserById(friendId);
        if (!user || !friend) {
            throw new Error('Пользователь или друг не найден');
        }
        if (user.friends.includes(friendId)) {
            throw new Error('Этот пользователь уже в друзьях');
        }
        user.friends.push(friendId);
        await this.updateUser(userId, { friends: user.friends });
    }
    /**
     * Удаляет друга у пользователя
     * @param userId ID пользователя
     * @param friendId ID друга
     */
    async removeFriend(userId: number, friendId: number): Promise<void> {
        const user = await this.getUserById(userId);
        if (!user) {
            throw new Error('Пользователь не найден');
        }
        user.friends = user.friends.filter(id => id !== friendId);
        await this.updateUser(userId, { friends: user.friends });
    }
}

export const userManager: UserManager = new UserManager(); // Экспорт экземпляра UserManager
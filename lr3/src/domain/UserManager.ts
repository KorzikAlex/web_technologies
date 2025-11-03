import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import type {User} from '../models/User';


export interface IUserManager {
    /**
     * Создание нового пользователя
     * @param username Имя пользователя
     * @param email Email пользователя
     * @param password Пароль пользователя
     * @returns {Promise<User>} Созданный пользователь
     */
    createUser(username: string, email: string, password: string): Promise<User>;

    /**
     * Проверка пароля пользователя
     * @param username Имя пользователя
     * @param password Пароль пользователя
     * @returns {Promise<User | null>} Пользователь или null, если пароль неверен
     */
    verifyPassword(username: string, password: string): Promise<User | null>;

    /**
     * Поиск пользователя по ID
     * @param id ID пользователя
     * @returns {Promise<User | null>} Пользователь или null, если не найден
     */
    findUserById(id: number): Promise<User | null>;

    /**
     * Получение всех пользователей
     * @returns {Promise<User[]>} Массив всех пользователей
     */
    getAllUsers(): Promise<User[]>;
}

/**
 * Класс для управления пользователями
 * @class UserManager
 * @implements {IUserManager}
 */
export class UserManager implements IUserManager {
    private readonly usersFilePath: string; // Путь к файлу с пользователями

    constructor() {
        // Инициализация пути к файлу с пользователями
        this.usersFilePath = path.resolve(import.meta.dirname, '../data/users.json');
    }

    /**
     * Загрузка пользователей из файла
     * @private
     * @returns {Promise<User[]>} Массив пользователей
     */
    private async loadUsers(): Promise<User[]> {
        try {
            const data: string = await fs.readFile(this.usersFilePath, 'utf-8'); // Чтение файла с пользователями
            return JSON.parse(data) as User[]; // Парсинг JSON данных
        } catch {
            return []; // Возвращаем пустой массив, если файл не найден или произошла ошибка
        }
    }

    private async saveUsers(users: User[]): Promise<void> {
        // Сохранение пользователей в файл
        await fs.writeFile(this.usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
    }

    private hashPassword(password: string, salt: string): string {
        // Хеширование пароля с использованием PBKDF2
        return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    }

    async createUser(username: string, email: string, password: string): Promise<User> {
        const users: User[] = await this.loadUsers(); // Загрузка существующих пользователей
        const salt: string = crypto.randomBytes(16).toString('hex'); // Генерация случайной соли
        const passwordHash: string = this.hashPassword(password, salt); // Хеширование пароля

        const newUser: User = {
            id: users.length > 0 ? Math.max(...users.map((u: User) => u.id)) + 1 : 1, // Генерация нового ID
            username, // Имя пользователя
            email, // Email пользователя
            passwordHash, // Хеш пароля
            salt, // Соль для хеширования
            friends: [], // Изначально нет друзей
            messages: {}, // Изначально нет сообщений
            feed: [], // Изначально пустая лента
            role: (users.length === 0) ? "admin" : "user" // Первый пользователь - админ
        }; // Создание нового пользователя

        users.push(newUser); // Добавление нового пользователя в массив
        await this.saveUsers(users); // Сохранение обновленного массива пользователей
        return newUser; // Возврат нового пользователя
    }

    async verifyPassword(username: string, password: string): Promise<User | null> {
        const users: User[] = await this.loadUsers(); // Загрузка пользователей
        // Поиск пользователя по имени
        const user: User | undefined = users.find((u: User): boolean => u.username === username);

        if (!user) {
            return null; // Возврат null, если пользователь не найден
        }

        const hash: string = this.hashPassword(password, user.salt); // Хеширование введенного пароля
        return hash === user.passwordHash ? user : null; // Сравнение хешей и возврат пользователя или null
    }

    /**
     * Поиск пользователя по заданному ключу и значению
     * @param key Ключ для поиска
     * @param value Значение для поиска
     * @private
     * @returns {Promise<User | null>} Пользователь или null, если не найден
     */
    private async findUserBy<K extends keyof User>(
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
    async findUserById(id: number): Promise<User | null> {
        return this.findUserBy('id', id); // Поиск пользователя по ID
    }

    /**
     * Поиск пользователя по имени пользователя
     * @param username
     * @returns {Promise<User | null>} Пользователь или null, если не найден
     */
    async findUserByUsername(username: string): Promise<User | null> {
        return this.findUserBy('username', username); // Поиск пользователя по имени пользователя
    }

    /**
     * Поиск пользователя по email
     * @param email
     * @returns {Promise<User | null>} Пользователь или null, если не найден
     */
    async findUserByEmail(email: string): Promise<User | null> {
        return this.findUserBy('email', email); // Поиск пользователя по email
    }

    /**
     * Получение всех пользователей
     * @returns {Promise<User[]>} Массив всех пользователей
     */
    async getAllUsers(): Promise<User[]> {
        return await this.loadUsers(); // Возврат всех пользователей
    }
}

export const userManager = new UserManager();

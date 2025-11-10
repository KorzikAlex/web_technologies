/**
 * @file User.ts
 * @fileOverview Модель данных пользователя системы.
 * @module models/User
 */

/**
 * Интерфейс, представляющий пользователя системы.
 * @interface User
 * @property {number} id - Уникальный идентификатор пользователя.
 * @property {string} username - Имя пользователя.
 * @property {string} email - Электронная почта пользователя.
 * @property {string} passwordHash - Хэш пароля пользователя.
 * @property {string} salt - Соль для хэша пароля.
 * @property {number[]} friends - Массив идентификаторов друзей пользователя.
 * @property {{[key: number]: string[]}} messages - Объект, где ключи - идентификаторы друзей, а значения - массивы сообщений с ними.
 * @property {string[]} feed - Массив записей в ленте пользователя.
 */
export interface User {
    id: number,
    username: string,
    email: string,
    passwordHash: string,
    salt: string,
    fullName?: string, // Оставляем для обратной совместимости, но будет формироваться автоматически
    surname: string,
    name: string,
    patronymic?: string,
    friends: number[],
    messages?: {
        [key: number]: string[]
    }, // ключ - id друга, значение - массив сообщений
    feed: string[], // массив записей в ленте
    role: UserRole,
    birthDate: string,
    status: UserStatus,
    avatar?: string,
}

/**
 * Тип, представляющий роль пользователя.
 */
export type UserRole = 'admin' | 'user';
export type UserStatus = 'pending' | 'active' | 'blocked';

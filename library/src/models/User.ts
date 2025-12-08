/**
 * @file User.ts
 * @fileOverview Модель данных пользователя системы.
 * @author KorzikAlex
 * @version 1.0
 * @license MIT
 * @module models/User
 */

/**
 * Роль пользователя в системе.
 * @typedef {'admin' | 'reader'} UserRole
 */
export type UserRole = 'admin' | 'reader';

/**
 * Интерфейс пользователя системы библиотеки.
 * @interface User
 * @property {number} id - Уникальный идентификатор пользователя
 * @property {string} username - Имя пользователя для входа
 * @property {string} [email] - Email пользователя (опционально)
 * @property {UserRole} role - Роль пользователя (admin/reader)
 * @property {string} salt - Соль для хеширования пароля
 * @property {string} passwordHash - Хеш пароля
 * @property {string} hash - Устаревшее поле для совместимости
 * @property {string} createdAt - Дата создания пользователя в формате ISO
 */
export interface User {
    id: number;
    username: string;
    email?: string;
    role: UserRole;
    salt: string;
    passwordHash: string;
    hash: string;
    createdAt: string;
}

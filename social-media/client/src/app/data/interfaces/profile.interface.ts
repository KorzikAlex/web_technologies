export type UserStatus = 'active' | 'unconfirmed' | 'banned'; // Статусы пользователя

export type UserRole = 'admin' | 'user'; // Роли пользователя

/**
 * Модель данных для пользователя в социальной сети
 * @interface User
 * @property {number} id - Уникальный идентификатор пользователя
 * @property {string} username - Имя пользователя
 * @property {string} name - Имя
 * @property {string} surname - Фамилия
 * @property {string} [patronymic] - Отчество (необязательно)
 * @property {Date} birthday - Дата рождения
 * @property {string} email - Электронная почта
 * @property {string} passwordHash - Хэш пароля
 * @property {Date} [createdAt] - Дата и время создания пользователя (необязательно)
 * @property {Date} [updatedAt] - Дата и время последнего обновления пользователя (необязательно)
 * @property {string} [avatarPath] - Путь к аватару пользователя (необязательно)
 * @property {UserStatus} status - Статус пользователя
 * @property {UserRole} role - Роль пользователя
 * @property {number[]} friends - Список ID друзей пользователя
 */
export interface User {
    id: number,
    username: string,
    name: string,
    surname: string,
    patronymic?: string | undefined,
    birthday: Date,
    email: string,
    passwordHash: string,
    createdAt?: Date | undefined,
    updatedAt?: Date | undefined,
    avatarPath?: string | undefined,
    status: UserStatus,
    role: UserRole,
    friends: number[]
}

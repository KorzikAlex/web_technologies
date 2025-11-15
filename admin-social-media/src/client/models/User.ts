export type UserStatus = 'active' | 'unconfirmed' | 'banned';

export type UserRole = 'admin' | 'user';

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
    role: UserRole
}
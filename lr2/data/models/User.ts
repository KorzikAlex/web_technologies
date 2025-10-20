export type UserRole = 'admin' | 'reader';

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

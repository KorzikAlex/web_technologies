import path from "node:path";
import type {User} from "../models/User.js";
import fs from 'fs/promises';

const __pathname: string = import.meta.url;
const __filename: string = path.basename(__pathname);
const __dirname: string = path.dirname(__pathname);

export type UserInfo = Omit<User, 'id' | 'createdAt' | 'status'>;

export class UserManager {
    private readonly dataPath: string = path.resolve(__dirname, '../data/', 'users.json');

    private async getUsers(): Promise<User[]> {
        try {
            const data: string = await fs.readFile(this.dataPath, 'utf-8');
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    private async saveUsers(users: User[]): Promise<void> {
        await fs.writeFile(this.dataPath, JSON.stringify(users, null, 4), 'utf-8');
    }

    async createUser(userInfo: UserInfo): Promise<User> {
        const users: User[] = await this.getUsers();
        const newUser: User = {
            id: users.length + 1,
            createdAt: new Date(),
            status: 'unconfirmed',
            ...userInfo
        };
        users.push(newUser);
        await this.saveUsers(users);
        return newUser;
    }

    private async getUserBy<K extends keyof User>(key: K, value: User[K]): Promise<User | null> {
        const users: User[] = await this.getUsers();
        return users.find((user: User): boolean =>
            user[key] === value
        ) ?? null;
    }

    async getUserById(id: number): Promise<User | null> {
        return this.getUserBy('id', id);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.getUserBy('email', email);
    }

    async getUserByUsername(username: string): Promise<User | null> {
        return this.getUserBy('username', username);
    }

    async updateUser(id: number, updates: Partial<User>): Promise<void> {
        const users: User[] = await this.getUsers();
        const existingUser: User | undefined = users.find((user: User): boolean =>
            user.id === id
        );

        if (!existingUser) {
            throw new Error('Пользователь не найден');
        }

        const updatedUser: User = {
            id: existingUser.id,
            username: existingUser.username,
            name: existingUser.name,
            surname: existingUser.surname,
            birthday: existingUser.birthday,
            email: existingUser.email,
            passwordHash: existingUser.passwordHash,
            status: existingUser.status,
            ...updates,
            updatedAt: new Date()
        };

        const userIndex: number = users.indexOf(existingUser);
        users[userIndex] = updatedUser;
        await this.saveUsers(users);
    }

    async deleteUser(id: number): Promise<boolean> {
        const users: User[] = await this.getUsers();
        const filteredUsers: User[] = users.filter((user: User): boolean =>
            user.id !== id
        );

        if (filteredUsers.length === users.length) {
            return false;
        }
        await this.saveUsers(filteredUsers);
        return true;
    }

    async getAllUsers(): Promise<User[]> {
        return this.getUsers();
    }
}

export const userManager: UserManager = new UserManager();
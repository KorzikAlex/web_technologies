import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import type {User, UserRole} from '../data/models/User.ts';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);
const READERS_FILE: string = path.join(__dirname, '../../data/readers.json');

export class UserManager {
    private async readUsers(): Promise<User[]> {
        await fs.mkdir(path.dirname(READERS_FILE), {recursive: true});
        try {
            const data = await fs.readFile(READERS_FILE, 'utf8');
            if (!data.trim()) return [];
            return JSON.parse(data);
        } catch (e: any) {
            if (e.code === 'ENOENT') return [];
            throw e;
        }
    }

    private async writeUsers(users: User[]): Promise<void> {
        await fs.writeFile(READERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    }

    async findUserByUsername(username: string): Promise<User | undefined> {
        const users = await this.readUsers();
        return users.find(u => u.username.toLowerCase() === username.toLowerCase());
    }

    async findUserById(id: number): Promise<User | undefined> {
        const users = await this.readUsers();
        return users.find(u => u.id === id);
    }

    async hasUsers(): Promise<boolean> {
        const users = await this.readUsers();
        return users.length > 0;
    }

    async createUser(params: {
        username: string;
        email?: string;
        password: string;
        role?: UserRole;
    }): Promise<User> {
        const users = await this.readUsers();
        const existing = users.find(u => u.username.toLowerCase() === params.username.toLowerCase());
        if (existing) {
            throw new Error('Пользователь с таким именем уже существует');
        }

        const {salt, hash} = await this.hashPassword(params.password);
        const hasUsers = users.length > 0;

        const newUser: User = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            username: params.username.trim(),
            email: params.email?.trim() as string,
            role: hasUsers ? (params.role ?? 'reader') : 'admin', // первый — admin
            salt,
            passwordHash: hash,
            hash: '', // для совместимости
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        await this.writeUsers(users);
        return newUser;
    }

    async verifyPassword(username: string, password: string): Promise<User | null> {
        const user: User | undefined = await this.findUserByUsername(username);
        if (!user) return null;

        const hash: string = await this.pbkdf2(password, user.salt);
        const equal =
            user.passwordHash.length === hash.length &&
            crypto.timingSafeEqual(Buffer.from(user.passwordHash, 'hex'), Buffer.from(hash, 'hex'));

        return equal ? user : null;
    }

    private async hashPassword(password: string): Promise<{ salt: string; hash: string }> {
        const salt: string = crypto.randomBytes(16).toString('hex');
        const hash: string = await this.pbkdf2(password, salt);
        return {salt, hash};
    }

    private async pbkdf2(password: string, salt: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            crypto.pbkdf2(password, Buffer.from(salt, 'hex'), 310000, 32, 'sha256', (err, derived): void => {
                if (err) return reject(err);
                resolve(derived.toString('hex'));
            });
        });
    }
}

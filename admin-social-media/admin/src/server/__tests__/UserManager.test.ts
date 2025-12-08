/**
 * @file UserManager.test.ts
 * @fileoverview Тесты для UserManager
 */
import { UserManager } from '../managers/UserManager.js';
import fs from 'fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('UserManager', () => {
    let userManager: UserManager;
    const originalDataPath = path.resolve(__dirname, '../data/', 'users.json');
    let backupData: string;

    beforeAll(async () => {
        // Создаем бэкап текущих данных
        try {
            backupData = await fs.readFile(originalDataPath, 'utf-8');
        } catch {
            backupData = '[]';
        }
    });

    beforeEach(async () => {
        // Создаем чистый тестовый файл перед каждым тестом
        await fs.writeFile(originalDataPath, '[]', 'utf-8');
        userManager = new UserManager();
    });

    afterAll(async () => {
        // Восстанавливаем оригинальные данные
        await fs.writeFile(originalDataPath, backupData, 'utf-8');
    });

    describe('createUser', () => {
        it('должен создать нового пользователя с корректными данными', async () => {
            const userInfo = {
                username: 'testuser',
                email: 'test@example.com',
                passwordHash: 'hashedpassword123',
                name: 'Test',
                surname: 'User',
                patronymic: 'Testovich',
                birthday: new Date('2000-01-01'),
                avatarPath: '',
                role: 'user' as const,
                updatedAt: new Date(),
            };

            const user = await userManager.createUser(userInfo);

            expect(user).toHaveProperty('id');
            expect(user.username).toBe('testuser');
            expect(user.email).toBe('test@example.com');
            expect(user.status).toBe('unconfirmed');
            expect(user.friends).toEqual([]);
        });

        it('должен автоматически генерировать уникальные ID', async () => {
            const userInfo1 = {
                username: 'user1',
                email: 'user1@example.com',
                passwordHash: 'hash1',
                name: 'User',
                surname: 'One',
                birthday: new Date('2000-01-01'),
                avatarPath: '',
                role: 'user' as const,
                updatedAt: new Date(),
            };

            const userInfo2 = {
                username: 'user2',
                email: 'user2@example.com',
                passwordHash: 'hash2',
                name: 'User',
                surname: 'Two',
                birthday: new Date('2000-01-02'),
                avatarPath: '',
                role: 'user' as const,
                updatedAt: new Date(),
            };

            const user1 = await userManager.createUser(userInfo1);
            const user2 = await userManager.createUser(userInfo2);

            expect(user1.id).toBe(1);
            expect(user2.id).toBe(2);
            expect(user1.id).not.toBe(user2.id);
        });
    });

    describe('getUserById', () => {
        it('должен вернуть пользователя по существующему ID', async () => {
            const userInfo = {
                username: 'findme',
                email: 'findme@example.com',
                passwordHash: 'hash',
                name: 'Find',
                surname: 'Me',
                birthday: new Date('2000-01-01'),
                avatarPath: '',
                role: 'user' as const,
                updatedAt: new Date(),
            };

            const createdUser = await userManager.createUser(userInfo);
            const foundUser = await userManager.getUserById(createdUser.id);

            expect(foundUser).not.toBeNull();
            expect(foundUser?.id).toBe(createdUser.id);
            expect(foundUser?.username).toBe('findme');
        });

        it('должен вернуть null для несуществующего ID', async () => {
            const foundUser = await userManager.getUserById(9999);
            expect(foundUser).toBeNull();
        });
    });

    describe('getUserByUsername', () => {
        it('должен найти пользователя по username', async () => {
            const userInfo = {
                username: 'uniqueuser',
                email: 'unique@example.com',
                passwordHash: 'hash',
                name: 'Unique',
                surname: 'User',
                birthday: new Date('2000-01-01'),
                avatarPath: '',
                role: 'user' as const,
                updatedAt: new Date(),
            };

            await userManager.createUser(userInfo);
            const foundUser = await userManager.getUserByUsername('uniqueuser');

            expect(foundUser).not.toBeNull();
            expect(foundUser?.username).toBe('uniqueuser');
            expect(foundUser?.email).toBe('unique@example.com');
        });
    });

    describe('updateUser', () => {
        it('должен обновить данные существующего пользователя', async () => {
            const userInfo = {
                username: 'updateme',
                email: 'old@example.com',
                passwordHash: 'hash',
                name: 'Update',
                surname: 'Me',
                birthday: new Date('2000-01-01'),
                avatarPath: '',
                role: 'user' as const,
                updatedAt: new Date(),
            };

            const createdUser = await userManager.createUser(userInfo);

            await userManager.updateUser(createdUser.id, {
                email: 'new@example.com',
                name: 'Updated',
            });

            const updatedUser = await userManager.getUserById(createdUser.id);

            expect(updatedUser?.email).toBe('new@example.com');
            expect(updatedUser?.name).toBe('Updated');
            expect(updatedUser?.surname).toBe('Me'); // Не изменилось
        });
    });

    describe('getAllUsers', () => {
        it('должен вернуть всех пользователей', async () => {
            const userInfo1 = {
                username: 'user1',
                email: 'user1@example.com',
                passwordHash: 'hash1',
                name: 'User',
                surname: 'One',
                birthday: new Date('2000-01-01'),
                avatarPath: '',
                role: 'user' as const,
                updatedAt: new Date(),
            };

            const userInfo2 = {
                username: 'user2',
                email: 'user2@example.com',
                passwordHash: 'hash2',
                name: 'User',
                surname: 'Two',
                birthday: new Date('2000-01-02'),
                avatarPath: '',
                role: 'admin' as const,
                updatedAt: new Date(),
            };

            await userManager.createUser(userInfo1);
            await userManager.createUser(userInfo2);

            const allUsers = await userManager.getAllUsers();

            expect(allUsers).toHaveLength(2);
            expect(allUsers[0]?.username).toBe('user1');
            expect(allUsers[1]?.username).toBe('user2');
        });
    });

    describe('addFriend', () => {
        it('должен добавить друга пользователю', async () => {
            const user1Info = {
                username: 'friend1',
                email: 'friend1@example.com',
                passwordHash: 'hash1',
                name: 'Friend',
                surname: 'One',
                birthday: new Date('2000-01-01'),
                avatarPath: '',
                role: 'user' as const,
                updatedAt: new Date(),
            };

            const user2Info = {
                username: 'friend2',
                email: 'friend2@example.com',
                passwordHash: 'hash2',
                name: 'Friend',
                surname: 'Two',
                birthday: new Date('2000-01-02'),
                avatarPath: '',
                role: 'user' as const,
                updatedAt: new Date(),
            };

            const user1 = await userManager.createUser(user1Info);
            const user2 = await userManager.createUser(user2Info);

            await userManager.addFriend(user1.id, user2.id);

            const updatedUser1 = await userManager.getUserById(user1.id);

            expect(updatedUser1?.friends).toContain(user2.id);
            expect(updatedUser1?.friends).toHaveLength(1);
        });

        it('должен выбросить ошибку при попытке добавить себя в друзья', async () => {
            const userInfo = {
                username: 'selfuser',
                email: 'self@example.com',
                passwordHash: 'hash',
                name: 'Self',
                surname: 'User',
                birthday: new Date('2000-01-01'),
                avatarPath: '',
                role: 'user' as const,
                updatedAt: new Date(),
            };

            const user = await userManager.createUser(userInfo);

            await expect(userManager.addFriend(user.id, user.id)).rejects.toThrow('Нельзя добавить себя в друзья');
        });
    });
});

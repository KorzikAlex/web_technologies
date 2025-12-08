/**
 * @file PostsManager.test.ts
 * @fileoverview Тесты для PostsManager
 */
import { PostsManager } from '../managers/PostsManager.js';
import fs from 'fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('PostsManager', () => {
    let postsManager: PostsManager;
    const originalDataPath = path.resolve(__dirname, '../data/', 'posts.json');
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
        postsManager = new PostsManager();
    });

    afterAll(async () => {
        // Восстанавливаем оригинальные данные
        await fs.writeFile(originalDataPath, backupData, 'utf-8');
    });

    describe('addPost', () => {
        it('должен создать новый пост с корректными данными', async () => {
            const postData = {
                authorId: '1',
                content: 'Это тестовый пост',
                imagePath: 'test.jpg',
            };

            const post = await postsManager.addPost(postData);

            expect(post).toHaveProperty('id');
            expect(post.authorId).toBe('1');
            expect(post.content).toBe('Это тестовый пост');
            expect(post.imagePath).toBe('test.jpg');
            expect(post.status).toBe('active');
        });

        it('должен автоматически генерировать уникальные ID', async () => {
            const post1Data = {
                authorId: '1',
                content: 'Первый пост',
            };

            const post2Data = {
                authorId: '1',
                content: 'Второй пост',
            };

            const post1 = await postsManager.addPost(post1Data);
            const post2 = await postsManager.addPost(post2Data);

            expect(post1.id).toBe(1);
            expect(post2.id).toBe(2);
            expect(post1.id).not.toBe(post2.id);
        });

        it('должен создать пост без изображения', async () => {
            const postData = {
                authorId: '2',
                content: 'Пост без изображения',
            };

            const post = await postsManager.addPost(postData);

            expect(post.imagePath).toBeUndefined();
            expect(post.content).toBe('Пост без изображения');
        });
    });

    describe('getAllPosts', () => {
        it('должен вернуть все посты', async () => {
            const post1Data = {
                authorId: '1',
                content: 'Пост 1',
            };

            const post2Data = {
                authorId: '2',
                content: 'Пост 2',
            };

            await postsManager.addPost(post1Data);
            await postsManager.addPost(post2Data);

            const allPosts = await postsManager.getAllPosts();

            expect(allPosts).toHaveLength(2);
            expect(allPosts[0]?.content).toBe('Пост 1');
            expect(allPosts[1]?.content).toBe('Пост 2');
        });

        it('должен вернуть пустой массив, если постов нет', async () => {
            const allPosts = await postsManager.getAllPosts();
            expect(allPosts).toEqual([]);
        });
    });

    describe('updatePost', () => {
        it('должен обновить содержимое поста', async () => {
            const postData = {
                authorId: '1',
                content: 'Старое содержимое',
            };

            const createdPost = await postsManager.addPost(postData);

            const success = await postsManager.updatePost(createdPost.id, {
                content: 'Новое содержимое',
            });

            expect(success).toBe(true);

            const allPosts = await postsManager.getAllPosts();
            const updatedPost = allPosts.find(p => p.id === createdPost.id);

            expect(updatedPost?.content).toBe('Новое содержимое');
        });

        it('должен вернуть false при обновлении несуществующего поста', async () => {
            const success = await postsManager.updatePost(9999, {
                content: 'Новое содержимое',
            });

            expect(success).toBe(false);
        });
    });

    describe('deletePost', () => {
        it('должен удалить существующий пост', async () => {
            const postData = {
                authorId: '1',
                content: 'Удаляемый пост',
            };

            const createdPost = await postsManager.addPost(postData);
            const success = await postsManager.deletePost(createdPost.id);

            expect(success).toBe(true);

            const allPosts = await postsManager.getAllPosts();
            expect(allPosts).toHaveLength(0);
        });

        it('должен вернуть false при удалении несуществующего поста', async () => {
            const success = await postsManager.deletePost(9999);
            expect(success).toBe(false);
        });
    });

    describe('deletePostsByAuthorId', () => {
        it('должен удалить все посты конкретного автора', async () => {
            await postsManager.addPost({ authorId: '1', content: 'Пост автора 1' });
            await postsManager.addPost({ authorId: '1', content: 'Еще пост автора 1' });
            await postsManager.addPost({ authorId: '2', content: 'Пост автора 2' });

            const deletedCount = await postsManager.deletePostsByAuthorId('1');

            expect(deletedCount).toBe(2);

            const remainingPosts = await postsManager.getAllPosts();
            expect(remainingPosts).toHaveLength(1);
            expect(remainingPosts[0]?.authorId).toBe('2');
        });

        it('должен вернуть 0, если у автора нет постов', async () => {
            const deletedCount = await postsManager.deletePostsByAuthorId('999');
            expect(deletedCount).toBe(0);
        });
    });
});

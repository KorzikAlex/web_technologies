/**
 * @file posts.ts
 * @fileoverview Роуты для работы с постами: создание, получение, обновление и удаление постов
 * @module postsRoutes
 */
import express, { type Router } from "express";
import { type Post } from "../../shared/models/Post.js";
import { postsManager } from "../managers/PostsManager.js";

export const router: Router = express.Router(); // Создание роутера для постов

router.get('/', async (req, res) => {
    try {
        const authorIdsParam = req.query.authorIds as string | undefined;
        const posts = await postsManager.getAllPosts();

        if (authorIdsParam) {
            const ids = authorIdsParam.split(',').map(s => Number(s)).filter(n => !isNaN(n));
            return res.json(posts.filter(p => ids.includes(Number(p.authorId))));
        }

        res.json(posts);
    } catch {
        res.status(500).json({ message: 'Failed to get posts' });
    }
});

router.post('/', async (req, res) => {
    try {
        const body = req.body;
        // Expect content, authorId, optional imagePath
        const created = await postsManager.addPost({
            content: body.content,
            authorId: String(body.authorId),
            imagePath: body.imagePath,
        });
        res.status(201).json(created);
    } catch {
        res.status(500).json({ message: 'Failed to create post' });
    }
});

router.put('/:id', async (req, res) => {
    const postId: number = Number(req.params.id);
    const updates: Partial<Post> = req.body;

    const success: boolean = await postsManager.updatePost(postId, updates);

    if (!success) {
        return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post updated successfully' });
});

router.delete('/:id', async (req, res) => {
    const postId: number = Number(req.params.id);
    const success: boolean = await postsManager.deletePost(postId);

    if (!success) {
        return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
});

// Server-Sent Events endpoint для реал-тайм обновлений
router.get('/stream', (req, res) => {
    // Устанавливаем заголовки для SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Добавляем клиента в список подписчиков
    postsManager.addSubscriber(res);

    // Отправляем начальное сообщение для подтверждения соединения
    res.write('data: {"type":"connected"}\n\n');
});

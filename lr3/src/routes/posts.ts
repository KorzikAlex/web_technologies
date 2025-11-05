import express, {Router, Request, Response} from 'express';
import {postsManager} from '../domain/PostsManager';
import {PostStatus} from "../models/Post";

export const router: Router = express.Router();

// Страница управления публикациями
router.get('/', (_req: Request, res: Response): void => {
    res.render('posts');
});

// API для получения всех публикаций
router.get('/api/posts', async (_req: Request, res: Response): Promise<void> => {
    try {
        const posts = await postsManager.getAllPosts();
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка получения публикаций'});
    }
});

// API для получения одной публикации
router.get('/api/posts/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        const post = await postsManager.getPostById(id);
        if (post) {
            res.json(post);
        } else {
            res.status(404).json({error: 'Публикация не найдена'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка получения публикации'});
    }
});


// API для обновления статуса публикации
router.put('/api/posts/:id/status', async (req: Request, res: Response): Promise<void> => {
    try {
        const {status} = req.body;
        const id = parseInt(req.params.id, 10);
        if (!['active', 'blocked'].includes(status)) {
            res.status(400).json({error: 'Неверный статус'});
            return;
        }
        const updatedPost = await postsManager.updatePostStatus(id, status as PostStatus);
        if (updatedPost) {
            res.json(updatedPost);
        } else {
            res.status(404).json({error: 'Публикация не найдена'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка обновления статуса'});
    }
});

export default router;

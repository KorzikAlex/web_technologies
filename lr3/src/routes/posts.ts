import express, {Router, Request, Response} from 'express';
import {postsManager} from '../domain/PostsManager';
import {PostStatus} from "../models/Post";
import {userManager} from "../domain/UserManager";

export const router: Router = express.Router();

// Страница управления публикациями
router.get('/', async (_req: Request, res: Response): Promise<void> => {
    try {
        const users = await userManager.getAllUsers();
        res.render('posts', {users});
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {error: 'Ошибка загрузки страницы'});
    }
});

// Страница ленты новостей конкретного пользователя
router.get('/feed/:userId', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const user = await userManager.getUserById(userId);

        if (!user) {
            res.status(404).render('error', {error: 'Пользователь не найден'});
            return;
        }

        const posts = await postsManager.getUserFeed(userId);
        posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


        res.render('feed', {
            pageTitle: `Лента новостей - ${user.fullName}`,
            userId: userId,
            userName: user.fullName,
            userAvatar: user.avatar,
            posts: posts
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {error: 'Ошибка загрузки страницы'});
    }
});

// API для создания новой публикации
router.post('/api/posts', async (req: Request, res: Response): Promise<void> => {
    try {
        const {authorId, content} = req.body;
        if (!authorId || !content) {
            res.status(400).json({error: 'Необходимо указать автора и содержание'});
            return;
        }
        const newPost = await postsManager.createPost(parseInt(authorId, 10), content);
        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка создания публикации'});
    }
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

// API для получения ленты новостей пользователя (его посты + посты друзей)
router.get('/api/feed/:userId', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const feed = await postsManager.getUserFeed(userId);

        // Сортируем по дате создания (новые первыми)
        feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        res.json(feed);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка получения ленты новостей'});
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

// API для редактирования содержания публикации
router.put('/api/posts/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        const {content, image} = req.body;

        if (!content) {
            res.status(400).json({error: 'Содержание обязательно'});
            return;
        }

        const updatedPost = await postsManager.updatePost(id, content, image);
        if (updatedPost) {
            res.json(updatedPost);
        } else {
            res.status(404).json({error: 'Публикация не найдена'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка обновления публикации'});
    }
});


router.delete('/api/posts/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        const success = await postsManager.deletePost(id);
        if (success) {
            res.status(204).send();
        } else {
            res.status(404).json({error: 'Публикация не найдена'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка удаления публикации'});
    }
});


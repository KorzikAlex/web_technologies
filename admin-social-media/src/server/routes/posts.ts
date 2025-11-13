import express, {type Router} from "express";
import {type Post} from "../models/Post.js";
import {postsManager} from "../managers/PostsManager.js";
import {fileURLToPath} from "node:url";
import path from "node:path";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

const router: Router = express.Router();


router.get('/', async (req, res) => {
    res.json(postsManager.getAllPosts());
});

router.post('/', async (req, res) => {
    const post: Post = req.body;
    await postsManager.addPost(post);
    res.status(201).json({message: 'Post created successfully'});
});

router.put('/:id', async (req, res) => {
    const postId: number = Number(req.params.id);
    const updates: Partial<Post> = req.body;

    const success: boolean = await postsManager.updatePost(postId, updates);

    if (!success) {
        return res.status(404).json({message: 'Post not found'});
    }

    res.json({message: 'Post updated successfully'});
});

router.delete('/:id', async (req, res) => {
    const postId: number = Number(req.params.id);
    const success: boolean = await postsManager.deletePost(postId);

    if (!success) {
        return res.status(404).json({message: 'Post not found'});
    }

    res.json({message: 'Post deleted successfully'});
});

export default router;
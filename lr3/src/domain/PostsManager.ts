import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import type {Post, PostStatus} from '../models/Post.js';
import {userManager} from './UserManager.js';
import {User} from "../models/User.js";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

export class PostsManager {
    private readonly dataPath: string = path.resolve(__dirname, '../data/posts.json');

    private async loadPosts(): Promise<Post[]> {
        try {
            const data: string = await fs.readFile(this.dataPath, 'utf-8');
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    private async savePosts(posts: Post[]): Promise<void> {
        await fs.writeFile(this.dataPath, JSON.stringify(posts, null, 4));
    }

    async getAllPosts(): Promise<(Post & { authorName: string })[]> {
        const posts: Post[] = await this.loadPosts();
        const users: User[] = await userManager.getAllUsers();

        // Формируем userMap с fullName из раздельных полей
        const userMap = new Map(users.map((u: User): [number, string] => {
            const fullName = u.patronymic
                ? `${u.surname} ${u.name} ${u.patronymic}`
                : `${u.surname} ${u.name}`;
            return [u.id, fullName];
        }));

        return posts.map((post: Post) => ({
            ...post,
            authorName: userMap.get(post.authorId) || 'Неизвестный автор'
        }));
    }

    async getPostById(id: number): Promise<(Post & { authorName: string }) | null> {
        const posts: Post[] = await this.loadPosts();
        const post = posts.find(p => p.id === id);
        if (!post) {
            return null;
        }
        if (!post) {
            return null;
        }

        const author: User | null = await userManager.getUserById(post.authorId);
        const authorName = author
            ? (author.patronymic
                ? `${author.surname} ${author.name} ${author.patronymic}`
                : `${author.surname} ${author.name}`)
            : 'Неизвестный автор';

        return {
            ...post,
            authorName
        };
    }

    async updatePostStatus(id: number, status: PostStatus): Promise<Post | null> {
        const posts: Post[] = await this.loadPosts();
        const postIndex: number = posts.findIndex((p: Post): boolean => p.id === id);
        if (postIndex === -1) {
            return null;
        }
        posts[postIndex].status = status;
        await this.savePosts(posts);
        return posts[postIndex];
    }

    async updatePost(id: number, content: string, image?: string): Promise<Post | null> {
        const posts: Post[] = await this.loadPosts();
        const postIndex: number = posts.findIndex((p: Post): boolean => p.id === id);
        if (postIndex === -1) {
            return null;
        }
        posts[postIndex].content = content;
        if (image !== undefined) {
            posts[postIndex].image = image || undefined;
        }
        await this.savePosts(posts);
        return posts[postIndex];
    }

    async createPost(authorId: number, content: string, image?: string): Promise<Post> {
        const posts: Post[] = await this.loadPosts();
        const newPost: Post = {
            id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
            authorId,
            content,
            image,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        posts.push(newPost);
        await this.savePosts(posts);
        return newPost;
    }

    async deletePost(id: number): Promise<boolean> {
        let posts: Post[] = await this.loadPosts();
        const initialLength: number = posts.length;
        posts = posts.filter((p: Post): boolean => p.id !== id);
        if (posts.length === initialLength) {
            return false;
        }
        await this.savePosts(posts);
        return true;
    }

    async getUserFeed(userId: number): Promise<(Post & { author: User | null })[]> {
        const posts: Post[] = await this.loadPosts();
        const user: User | null = await userManager.getUserById(userId);

        if (!user) {
            return [];
        }

        const feedPosts: Post[] = posts.filter((p: Post): boolean =>
            p.authorId === userId || user.friends.includes(p.authorId)
        );

        return Promise.all(feedPosts.map(async (post: Post) => ({
            ...post,
            author: await userManager.getUserById(post.authorId)
        })));
    }
}

export const postsManager = new PostsManager();

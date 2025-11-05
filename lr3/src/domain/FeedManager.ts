import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import type {Post} from '../models/Post';
import {userManager} from './UserManager';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FeedManager {
    private readonly dataPath = path.resolve(__dirname, '../data/posts.json');

    private async loadPosts(): Promise<Post[]> {
        try {
            const data = await fs.readFile(this.dataPath, 'utf-8');
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    private async savePosts(posts: Post[]): Promise<void> {
        await fs.writeFile(this.dataPath, JSON.stringify(posts, null, 4));
    }

    async createPost(authorId: number, content: string, image?: string): Promise<Post> {
        const posts = await this.loadPosts();
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

    async getUserFeed(userId: number): Promise<(Post & {author: any})[]> {
        const posts = await this.loadPosts();
        const user = await userManager.getUserById(userId);

        const feedPosts = posts.filter(p =>
            p.authorId === userId || user?.friends.includes(p.authorId)
        );

        return Promise.all(feedPosts.map(async post => ({
            ...post,
            author: await userManager.getUserById(post.authorId)
        })));
    }
}

export const feedManager = new FeedManager();

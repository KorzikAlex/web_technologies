import path from "node:path";
import type {Post} from "../models/Post.js";
import fs from "fs/promises";
import {fileURLToPath} from "node:url";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

export class PostsManager {
    private readonly dataPath: string = path.resolve(__dirname, '../data/', 'posts.json');

    private async getPosts(): Promise<Post[]> {
        try {
            const data: string = await fs.readFile(this.dataPath, 'utf-8');
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    private async savePosts(posts: Post[]): Promise<void> {
        await fs.writeFile(this.dataPath, JSON.stringify(posts, null, 4), 'utf-8');
    }

    async addPost(post: Post): Promise<void> {
        const posts: Post[] = await this.getPosts();
        posts.push(post);
        await this.savePosts(posts);
    }

    async getAllPosts(): Promise<Post[]> {
        return this.getPosts();
    }

    async deletePost(postId: number): Promise<boolean> {
        const posts: Post[] = await this.getPosts();
        const filteredPosts: Post[] = posts.filter((post: Post): boolean => post.id !== postId);
        if (filteredPosts.length === posts.length) {
            return false;
        }
        await this.savePosts(filteredPosts);
        return true;
    }

    async updatePost(id: number, updates: Partial<Post>): Promise<boolean> {
        const posts: Post[] = await this.getPosts();
        const existingPost: Post | undefined = posts.find((p: Post): boolean => p.id === id);

        if (!existingPost) {
            return false;
        }

        const updatedPost: Post = {
            id: existingPost.id,
            authorId: existingPost.authorId,
            content: existingPost.content,
            createdAt: existingPost.createdAt,
            updatedAt: existingPost.updatedAt,
            status: existingPost.status,
            ...updates
        };

        const index: number = posts.indexOf(existingPost);
        posts[index] = updatedPost;
        await this.savePosts(posts);
        return true;
    }
}

export const postsManager = new PostsManager();
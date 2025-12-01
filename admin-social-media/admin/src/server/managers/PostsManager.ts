/**
 * @file PostsManager.ts
 * @fileoverview Менеджер для работы с постами: добавление, получение, удаление и обновление постов
 * @module PostsManager
 */
import path from "node:path";
import type {Post} from "../../shared/models/Post.js";
import fs from "fs/promises";
import {fileURLToPath} from "node:url";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

export class PostsManager {
    private readonly dataPath: string = path.resolve(__dirname, '../data/', 'posts.json');

    private async getPosts(): Promise<Post[]> {
        try {
            const data: string = await fs.readFile(this.dataPath, 'utf-8');
            const parsed = JSON.parse(data) as any[];
            return parsed.map((p: any) => ({
                ...p,
                createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
                updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
            })) as Post[];
        } catch {
            return [];
        }
    }

    private async savePosts(posts: Post[]): Promise<void> {
        // Serialize dates to ISO strings for storage
        const toSave = posts.map(p => ({
            ...p,
            createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
            updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
        }));
        await fs.writeFile(this.dataPath, JSON.stringify(toSave, null, 4), 'utf-8');
    }

    async addPost(post: Partial<Post> & { authorId: string; content: string; imagePath?: string }): Promise<Post> {
        const posts: Post[] = await this.getPosts();
        const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
        const now = new Date();
        const newPost: Post = {
            id: newId,
            authorId: post.authorId,
            content: post.content,
            createdAt: now,
            updatedAt: now,
            imagePath: post.imagePath,
            status: 'active',
        } as Post;
        posts.push(newPost);
        await this.savePosts(posts);
        return newPost;
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
            updatedAt: new Date(),
            status: existingPost.status,
            imagePath: existingPost.imagePath,
            ...updates
        };

        const index: number = posts.indexOf(existingPost);
        posts[index] = updatedPost;
        await this.savePosts(posts);
        return true;
    }

    async deletePostsByAuthorId(authorId: string): Promise<number> {
        const posts: Post[] = await this.getPosts();
        const filteredPosts: Post[] = posts.filter((post: Post): boolean => post.authorId !== authorId);
        const deletedCount: number = posts.length - filteredPosts.length;
        if (deletedCount > 0) {
            await this.savePosts(filteredPosts);
        }
        return deletedCount;
    }
}

export const postsManager = new PostsManager();
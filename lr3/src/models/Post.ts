export type PostStatus = 'active' | 'blocked';

export interface Post {
    id: number;
    authorId: number;
    content: string;
    image?: string;
    status: PostStatus;
    createdAt: string;
    createdAtDate?: Date;
}
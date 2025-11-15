export type PostStatus = 'active' | 'blocked';

export interface Post {
    id: number,
    authorId: string,
    content: string,
    createdAt: Date,
    updatedAt: Date,
    imagePath?: string | undefined,
    status: PostStatus
}
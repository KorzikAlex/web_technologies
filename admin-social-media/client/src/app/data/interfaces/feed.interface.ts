export type PostStatus = 'active' | 'blocked';

export interface FeedInterface {
    id: number;
    authorId: number;
    content: string;
    image?: string | null;
    status: PostStatus;
    createdAt: string;
}

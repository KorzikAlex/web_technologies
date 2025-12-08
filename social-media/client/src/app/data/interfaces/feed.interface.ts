export type PostStatus = 'active' | 'blocked';

export interface FeedInterface {
    id: number;
    authorId: string; // Изменено с number на string для соответствия серверной модели
    content: string;
    imagePath?: string | null; // Переименовано с image на imagePath для соответствия серверной модели
    status: PostStatus;
    createdAt: string;
}

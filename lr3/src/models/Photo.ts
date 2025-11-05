export type PhotoStatus = 'active' | 'blocked';

export interface Photo {
    id: number;
    userId: number;
    url: string;
    caption?: string;
    status: PhotoStatus;
    createdAt: string;
}

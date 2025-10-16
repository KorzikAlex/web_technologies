export interface Book {
    id: string;
    title: string;
    author: string;
    isAvailable: boolean;
    borrowedBy: string | null;
}

export type BookStatus = 'all' | 'available' | 'borrowed';
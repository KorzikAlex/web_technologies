export interface Book {
    id: number;
    title: string;
    author: string;
    publishDate: string;
    isAvailable: boolean;
    borrowedBy: number | null; // ID читателя
    borrowDate: string | null; // дата выдачи
    returnDate: string | null; // планируемая дата возврата
}

export type BookStatus = 'all' | 'available' | 'borrowed' | 'overdue';
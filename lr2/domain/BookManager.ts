import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Book, BookStatus } from '../../data/models/Book.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BOOKS_FILE = path.join(__dirname, '../../data/books.json');

export class BookManager {
    private async readBooks(): Promise<Book[]> {
        await fs.mkdir(path.dirname(BOOKS_FILE), { recursive: true });
        try {
            const data = await fs.readFile(BOOKS_FILE, 'utf8');
            if (!data.trim()) return [];
            return JSON.parse(data);
        } catch (e: any) {
            if (e.code === 'ENOENT') return [];
            throw e;
        }
    }

    private async writeBooks(books: Book[]): Promise<void> {
        await fs.writeFile(BOOKS_FILE, JSON.stringify(books, null, 2), 'utf8');
    }

    async getAllBooks(): Promise<Book[]> {
        return await this.readBooks();
    }

    async getBookById(id: number): Promise<Book | undefined> {
        const books = await this.readBooks();
        return books.find(b => b.id === id);
    }

    async filterBooks(status?: BookStatus, returnDate?: string): Promise<Book[]> {
        const books = await this.readBooks();
        const now = new Date();

        return books.filter(book => {
            // Фильтр по статусу
            if (status === 'available' && !book.isAvailable) return false;
            if (status === 'borrowed' && book.isAvailable) return false;
            if (status === 'overdue') {
                if (book.isAvailable || !book.returnDate) return false;
                if (new Date(book.returnDate) >= now) return false;
            }

            // Фильтр по дате возврата
            if (returnDate && book.returnDate !== returnDate) return false;

            return true;
        });
    }

    async createBook(data: Omit<Book, 'id'>): Promise<Book> {
        const books = await this.readBooks();
        const newBook: Book = {
            ...data,
            id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1,
        };
        books.push(newBook);
        await this.writeBooks(books);
        return newBook;
    }

    async updateBook(id: number, updates: Partial<Book>): Promise<Book> {
        const books = await this.readBooks();
        const index = books.findIndex(b => b.id === id);
        if (index === -1) throw new Error('Книга не найдена');

        books[index] = { ...books[index], ...updates };
        await this.writeBooks(books);
        return books[index];
    }

    async deleteBook(id: number): Promise<void> {
        const books = await this.readBooks();
        const filtered = books.filter(b => b.id !== id);
        if (filtered.length === books.length) throw new Error('Книга не найдена');
        await this.writeBooks(filtered);
    }

    async borrowBook(bookId: number, userId: number, days: number = 14): Promise<Book> {
        const book = await this.getBookById(bookId);
        if (!book) throw new Error('Книга не найдена');
        if (!book.isAvailable) throw new Error('Книга уже выдана');

        const borrowDate = new Date();
        const returnDate = new Date(borrowDate);
        returnDate.setDate(returnDate.getDate() + days);

        return await this.updateBook(bookId, {
            isAvailable: false,
            borrowedBy: userId,
            borrowDate: borrowDate.toISOString(),
            returnDate: returnDate.toISOString(),
        });
    }

    async returnBook(bookId: number): Promise<Book> {
        const book = await this.getBookById(bookId);
        if (!book) throw new Error('Книга не найдена');
        if (book.isAvailable) throw new Error('Книга не была выдана');

        return await this.updateBook(bookId, {
            isAvailable: true,
            borrowedBy: null,
            borrowDate: null,
            returnDate: null,
        });
    }
}

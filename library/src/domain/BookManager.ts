/**
 * @file BookManager.ts
 * @fileOverview Менеджер для управления книгами библиотеки.
 * @author KorzikAlex
 * @version 1.0
 * @license MIT
 * @module domain/BookManager
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import type {Book, BookStatus} from '../models/Book.js';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);
const BOOKS_FILE: string = path.join(__dirname, '../../data/books.json');

/**
 * Класс для управления книгами библиотеки.
 * @class BookManager
 */
export class BookManager {
    /**
     * Читает список книг из файла.
     * @private
     * @async
     * @returns {Promise<Book[]>} Массив книг
     */
    private async readBooks(): Promise<Book[]> {
        await fs.mkdir(path.dirname(BOOKS_FILE), {recursive: true});
        try {
            const data: string = await fs.readFile(BOOKS_FILE, 'utf8');
            if (!data.trim()) return [];
            return JSON.parse(data);
        } catch (e: any) {
            if (e.code === 'ENOENT') return [];
            throw e;
        }
    }

    /**
     * Записывает список книг в файл.
     * @private
     * @async
     * @param {Book[]} books - Массив книг для сохранения
     * @returns {Promise<void>}
     */
    private async writeBooks(books: Book[]): Promise<void> {
        await fs.writeFile(BOOKS_FILE, JSON.stringify(books, null, 2), 'utf8');
    }

    /**
     * Получает все книги из библиотеки.
     * @async
     * @returns {Promise<Book[]>} Массив всех книг
     */
    async getAllBooks(): Promise<Book[]> {
        return await this.readBooks();
    }

    /**
     * Получает книгу по ID.
     * @async
     * @param {number} id - ID книги
     * @returns {Promise<Book | undefined>} Книга или undefined, если не найдена
     */
    async getBookById(id: number): Promise<Book | undefined> {
        const books: Book[] = await this.readBooks();
        return books.find(b => b.id === id);
    }

    /**
     * Фильтрует книги по статусу и дате возврата.
     * @async
     * @param {BookStatus} [status] - Статус книги для фильтрации
     * @param {string} [returnDate] - Дата возврата для фильтрации
     * @returns {Promise<Book[]>} Отфильтрованный массив книг
     */
    async filterBooks(status?: BookStatus, returnDate?: string): Promise<Book[]> {
        const books: Book[] = await this.readBooks();
        const now = new Date();

        return books.filter(book => {
            if (status === 'available' && !book.isAvailable) {
                return false;
            }
            if (status === 'borrowed' && book.isAvailable) {
                return false;
            }
            if (status === 'overdue') {
                if (book.isAvailable || !book.returnDate) {
                    return false;
                }
                if (new Date(book.returnDate) >= now) {
                    return false;
                }
            }

            return !(returnDate && book.returnDate !== returnDate);
        });
    }

    /**
     * Создает новую книгу в библиотеке.
     * @async
     * @param {Omit<Book, 'id'>} data - Данные книги без ID
     * @returns {Promise<Book>} Созданная книга с присвоенным ID
     */
    async createBook(data: Omit<Book, 'id'>): Promise<Book> {
        const books: Book[] = await this.readBooks();
        const newBook: Book = {
            ...data,
            id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1,
        };
        books.push(newBook);
        await this.writeBooks(books);
        return newBook;
    }

    /**
     * Обновляет данные книги.
     * @async
     * @param {number} id - ID книги
     * @param {Partial<Book>} updates - Поля для обновления
     * @returns {Promise<Book>} Обновленная книга
     * @throws {Error} Если книга не найдена
     */
    async updateBook(id: number, updates: Partial<Book>): Promise<Book> {
        const books: Book[] = await this.readBooks();
        const index: number = books.findIndex(b => b.id === id);
        if (index === -1) {
            throw new Error('Книга не найдена');
        }

        const currentBook: Book | undefined = books[index];
        if (!currentBook) {
            throw new Error('Книга не найдена');
        }

        books[index] = {...currentBook, ...updates};
        await this.writeBooks(books);
        return books[index]!;
    }

    /**
     * Удаляет книгу из библиотеки.
     * @async
     * @param {number} id - ID книги
     * @returns {Promise<void>}
     * @throws {Error} Если книга не найдена
     */
    async deleteBook(id: number): Promise<void> {
        const books: Book[] = await this.readBooks();
        const filtered: Book[] = books.filter(b => b.id !== id);
        if (filtered.length === books.length) {
            throw new Error('Книга не найдена');
        }
        await this.writeBooks(filtered);
    }

    /**
     * Выдает книгу читателю.
     * @async
     * @param {number} bookId - ID книги
     * @param {number} userId - ID читателя
     * @param {number} [days=14] - Количество дней для выдачи
     * @returns {Promise<Book>} Обновленная книга
     * @throws {Error} Если книга не найдена или уже выдана
     */
    async borrowBook(bookId: number, userId: number, days: number = 14): Promise<Book> {
        const book: Book | undefined = await this.getBookById(bookId);
        if (!book) {
            throw new Error('Книга не найдена');
        }
        if (!book.isAvailable) {
            throw new Error('Книга уже выдана');
        }


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

    /**
     * Возвращает книгу в библиотеку.
     * @async
     * @param {number} bookId - ID книги
     * @returns {Promise<Book>} Обновленная книга
     * @throws {Error} Если книга не найдена или не была выдана
     */
    async returnBook(bookId: number): Promise<Book> {
        const book: Book | undefined = await this.getBookById(bookId);
        if (!book) {
            throw new Error('Книга не найдена');
        }
        if (book.isAvailable) {
            throw new Error('Книга не была выдана');
        }

        return await this.updateBook(bookId, {
            isAvailable: true,
            borrowedBy: null,
            borrowDate: null,
            returnDate: null,
        });
    }
}

/**
 * @file Book.ts
 * @fileOverview Модель данных книги библиотеки.
 * @author KorzikAlex
 * @version 1.0
 * @license MIT
 * @module models/Book
 */

/**
 * Интерфейс книги библиотеки.
 * @interface Book
 * @property {number} id - Уникальный идентификатор книги
 * @property {string} title - Название книги
 * @property {string} author - Автор книги
 * @property {string} publishDate - Дата публикации в формате ISO
 * @property {boolean} isAvailable - Доступна ли книга для выдачи
 * @property {number | null} borrowedBy - ID читателя, взявшего книгу
 * @property {string | null} borrowDate - Дата выдачи книги в формате ISO
 * @property {string | null} returnDate - Планируемая дата возврата в формате ISO
 */
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

/**
 * Статус книги для фильтрации.
 */
export type BookStatus = 'all' | 'available' | 'borrowed' | 'overdue';
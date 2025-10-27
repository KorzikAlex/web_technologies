/**
 * @file books.ts
 * @fileOverview Маршруты для управления книгами библиотеки.
 * @author KorzikAlex
 * @version 1.0
 * @license MIT
 * @module routes/books
 */
import express, {type Request, type Response, type NextFunction, type Router} from 'express';
import {ensureAuthenticated, ensureRole} from './auth.js';
import {BookManager} from '../domain/BookManager.js';
import {UserManager} from '../domain/UserManager.js';
import type {User} from '../models/User.js';
import type {Book, BookStatus} from '../models/Book.js';

const router: Router = express.Router();
const bookManager = new BookManager();
const userManager = new UserManager();

/**
 * GET /books - Страница списка книг с фильтрами.
 * @function
 * @param {Request} req - Объект запроса Express
 * @param {Response} res - Объект ответа Express
 * @returns {Promise<void>}
 */
router.get('/', ensureAuthenticated, async (req: Request, res: Response) => {
    const books: Book[] = await bookManager.getAllBooks();
    const users: User[] = await userManager['readUsers']();

    res.render('books', {
        title: 'Библиотека',
        books,
        users,
        user: req.user as User,
    });
});

/**
 * GET /books/api - REST API эндпоинт для AJAX фильтрации книг.
 * @function
 * @param {Request} req - Объект запроса Express
 * @param {Response} res - Объект ответа Express
 * @returns {Promise<void>}
 * @description Принимает параметры status и returnDate для фильтрации списка книг
 */
router.get('/api', ensureAuthenticated, async (req: Request, res: Response) => {
    try {
        const status = req.query.status as BookStatus | undefined;
        const returnDate = req.query.returnDate as string | undefined;

        const books: Book[] = await bookManager.filterBooks(status, returnDate);
        res.json(books);
    } catch (err: any) {
        res.status(500).json({error: err.message});
    }
});

/**
 * GET /books/:id - Страница детальной информации о книге.
 * @function
 * @param {Request} req - Объект запроса Express
 * @param {Response} res - Объект ответа Express
 * @returns {Promise<void>}
 */
router.get('/:id', ensureAuthenticated, async (req: Request, res: Response) => {
    const id: string | undefined = req.params.id;
    if (!id) {
        return res.status(400).json({error: 'ID не указан'});
    }
    try {
        const book: Book | undefined = await bookManager.getBookById(parseInt(id));
        if (!book) return res.status(404).send('Книга не найдена');

        let borrower = null;
        if (book.borrowedBy) {
            borrower = await userManager.findUserById(book.borrowedBy);
        }

        res.render('book-detail', {
            title: book.title,
            book,
            borrower,
            user: req.user as User,
        });
    } catch (err: any) {
        res.status(500).send(err.message);
    }
});

/**
 * POST /books - Создание новой книги (только для администраторов).
 * @function
 * @param {Request} req - Объект запроса Express
 * @param {Response} res - Объект ответа Express
 * @returns {Promise<void>}
 */
router.post('/', ensureAuthenticated, ensureRole('admin'), async (req: Request, res: Response) => {
    try {
        const book = await bookManager.createBook({
            title: req.body.title,
            author: req.body.author,
            publishDate: req.body.publishDate,
            isAvailable: true,
            borrowedBy: null,
            borrowDate: null,
            returnDate: null,
        });
        res.status(201).json(book);
    } catch (err: any) {
        res.status(400).json({error: err.message});
    }
});

/**
 * GET /books/:id/edit - Страница редактирования книги (только для администраторов).
 * @function
 * @param {Request} req - Объект запроса Express
 * @param {Response} res - Объект ответа Express
 * @returns {Promise<void>}
 */
router.get('/:id/edit', ensureAuthenticated, ensureRole('admin'), async (req: Request, res: Response) => {
    const id: string | undefined = req.params.id;
    if (!id) {
        return res.status(400).json({error: 'ID не указан'});
    }
    try {
        const book: Book | undefined = await bookManager.getBookById(parseInt(id));
        if (!book) return res.status(404).send('Книга не найдена');

        res.render('book-edit', {
            title: 'Редактирование книги',
            book,
            user: req.user as User,
        });
    } catch (err: any) {
        res.status(500).send(err.message);
    }
});

/**
 * POST /books/:id/edit - Сохранение изменений книги (только для администраторов).
 * @function
 * @param {Request} req - Объект запроса Express
 * @param {Response} res - Объект ответа Express
 * @returns {Promise<void>}
 */
router.post('/:id/edit', ensureAuthenticated, ensureRole('admin'), async (req: Request, res: Response) => {
    const id: string | undefined = req.params.id;
    if (!id) {
        return res.status(400).json({error: 'ID не указан'});
    }
    try {
        await bookManager.updateBook(parseInt(id), {
            title: req.body.title,
            author: req.body.author,
            publishDate: req.body.publishDate,
        });
        res.redirect(`/books/${id}`);
    } catch (err: any) {
        res.status(500).send(err.message);
    }
});

/**
 * DELETE /books/:id - Удаление книги (только для администраторов).
 * @function
 * @param {Request} req - Объект запроса Express
 * @param {Response} res - Объект ответа Express
 * @returns {Promise<void>}
 */
router.delete('/:id', ensureAuthenticated, ensureRole('admin'), async (req: Request, res: Response) => {
    const id: string | undefined = req.params.id;
    if (!id) {
        return res.status(400).json({error: 'ID не указан'});
    }
    try {
        await bookManager.deleteBook(parseInt(id));
        res.sendStatus(204);
    } catch (err: any) {
        res.status(500).json({error: err.message});
    }
});

/**
 * POST /books/:id/borrow - Выдача книги читателю.
 * @function
 * @param {Request} req - Объект запроса Express
 * @param {Response} res - Объект ответа Express
 * @returns {Promise<void>}
 * @description Выдает книгу текущему пользователю на указанное количество дней
 */
router.post('/:id/borrow', ensureAuthenticated, async (req: Request, res: Response) => {
    const id: string | undefined = req.params.id;
    if (!id) {
        return res.status(400).json({error: 'ID не указан'});
    }
    try {
        const days: number = parseInt(req.body.days) || 14;
        await bookManager.borrowBook(parseInt(id), (req.user as User).id, days);
        res.redirect(`/books/${id}`);
    } catch (err: any) {
        res.status(400).send(err.message);
    }
});

/**
 * POST /books/:id/return - Возврат книги в библиотеку.
 * @function
 * @param {Request} req - Объект запроса Express
 * @param {Response} res - Объект ответа Express
 * @returns {Promise<void>}
 */
router.post('/:id/return', ensureAuthenticated, async (req: Request, res: Response) => {
    const id: string | undefined = req.params.id;
    if (!id) {
        return res.status(400).json({error: 'ID не указан'});
    }
    try {
        await bookManager.returnBook(parseInt(id));
        res.redirect(`/books/${id}`);
    } catch (err: any) {
        res.status(400).send(err.message);
    }
});

export default router;

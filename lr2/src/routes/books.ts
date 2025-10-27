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
 * GET /books - Страница списка книг
 */
router.get('/', ensureAuthenticated, async (req: Request, res: Response) => {
    const books: Book[] = await bookManager.getAllBooks();
    const users: User[] = await userManager['readUsers'](); // для отображения имён читателей

    res.render('books', {
        title: 'Библиотека',
        books,
        users,
        user: req.user as User,
    });
});

/**
 * GET /books/api - REST API для фильтрации (AJAX)
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
 * GET /books/:id - Карточка книги
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
 * POST /books - Создать книгу (только администраторы)
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
 * PUT /books/:id - Обновить книгу (только администраторы)
 */
router.put('/:id', ensureAuthenticated, ensureRole('admin'), async (req: Request, res: Response) => {
    const id: string | undefined = req.params.id;
    if (!id) {
        return res.status(400).json({error: 'ID не указан'});
    }
    try {
        const book: Book = await bookManager.updateBook(parseInt(id), req.body);
        res.json(book);
    } catch (err: any) {
        res.status(400).json({error: err.message});
    }
});

/**
 * DELETE /books/:id - Удалить книгу (только администраторы)
 */
router.delete('/:id', ensureAuthenticated, ensureRole('admin'), async (req: Request, res: Response) => {
    const id: string | undefined = req.params.id;
    if (!id) {
        return res.status(400).json({error: 'ID не указан'});
    }
    try {
        await bookManager.deleteBook(parseInt(id));
        res.status(204).send();
    } catch (err: any) {
        res.status(400).json({error: err.message});
    }
});

/**
 * POST /books/:id/borrow - Выдать книгу
 */
router.post('/:id/borrow', ensureAuthenticated, async (req: Request, res: Response) => {
    const id: string | undefined = req.params.id;
    if (!id) {
        return res.status(400).json({error: 'ID не указан'});
    }
    try {
        const user = req.user as User;
        const days: number = parseInt(req.body.days) || 14;
        await bookManager.borrowBook(parseInt(id), user.id, days);
        res.redirect(`/books/${id}`);
    } catch (err: any) {
        res.status(400).send(err.message);
    }
});

/**
 * POST /books/:id/return - Вернуть книгу
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

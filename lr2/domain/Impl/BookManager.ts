import type {IManager} from "../api/IManager";
import fs from 'fs';
import path from "node:path";
import * as fs from "node:fs";
import * as fs from "node:fs";
import {Book} from "../../data/models/Book";

const BOOKS_FILE = path.join(__dirname, '../../data/books.json');

export class BookManager implements IManager {
    addItem(): void {
    }

    addItems(): void {
    }

    deleteItem(): void {
    }

    deleteItems(): void {
    }

    getItem(): void {
    }

    getItems() {
        if (!fs.existsSync(BOOKS_FILE)) {
            this.saveItems(initialBooks);
            return initialBooks;
        }
        const data = fs.readFileSync(BOOKS_FILE, 'utf-8');
        return JSON.parse(data);
    }

    updateItem(): void {
    }

    updateItems(): void {
    }

    saveItem(): void {
    }

    saveItems(books: Book[]): void {
    }

}
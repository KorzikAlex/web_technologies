/**
 * @file books-client.ts
 * @fileOverview Клиентская логика для страницы списка книг.
 * @author KorzikAlex
 * @version 1.0
 * @license MIT
 * @module public/books-client
 */

/** Элемент выбора фильтра по статусу */
const statusFilter = document.getElementById('statusFilter') as HTMLSelectElement;
/** Элемент выбора фильтра по дате */
const dateFilter = document.getElementById('dateFilter') as HTMLInputElement;
/** Кнопка очистки фильтров */
const clearFiltersBtn = document.getElementById('clearFilters') as HTMLButtonElement;
/** Контейнер списка книг */
const booksList = document.getElementById('booksList') as HTMLDivElement;
/** Модальное окно добавления книги */
const addBookDialog = document.getElementById('addBookDialog') as HTMLDialogElement;
/** Форма добавления книги */
const addBookForm = document.getElementById('addBookForm') as HTMLFormElement;

import type {Book, BookStatus} from '../src/models/Book.js';
import type {User} from '../src/models/User.js';

statusFilter.addEventListener('change', filterBooks);
dateFilter.addEventListener('change', filterBooks);
clearFiltersBtn.addEventListener('click', () => {
    statusFilter.value = 'all';
    dateFilter.value = '';
    filterBooks();
});

/**
 * Фильтрует книги через AJAX запрос.
 * @async
 * @returns {Promise<void>}
 */
async function filterBooks(): Promise<void> {
    const status: string = statusFilter.value;
    const returnDate: string = dateFilter.value;

    const params = new URLSearchParams();
    if (status !== 'all') {
        params.append('status', status);
    }
    if (returnDate) {
        params.append('returnDate', returnDate);
    }

    try {
        const res: Response = await fetch(`/books/api?${params}`);
        if (!res.ok) {
            throw new Error('Ошибка при загрузке книг');
        }
        const books: Book[] = await res.json();
        renderBooks(books);
    } catch (err) {
        console.error(err);
        alert('Ошибка при фильтрации книг');
    }
}

/**
 * Отрисовывает список книг в таблице.
 * @param {Book[]} books - Массив книг для отображения
 * @returns {void}
 */
function renderBooks(books: Book[]): void {
    if (books.length === 0) {
        booksList.innerHTML = '<p class="w3-center w3-text-grey">Книги не найдены</p>';
        return;
    }

    booksList.innerHTML = `
        <table class="w3-table w3-bordered w3-striped w3-white w3-round books-table">
            <thead>
                <tr class="w3-blue-grey">
                    <th>Название</th>
                    <th>Автор</th>
                    <th>Статус</th>
                    <th>Читатель</th>
                    <th>Дата возврата</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                ${books.map(book => renderBookRow(book)).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Формирует HTML-разметку строки таблицы для книги.
 * @param {Book} book - Объект книги
 * @returns {string} HTML-строка
 */
function renderBookRow(book: Book): string {
    const userRole: string | undefined = document.body.dataset.userRole;
    const statusText: string = book.isAvailable ? 'Доступна' : 'Выдана';
    const statusClass: string = book.isAvailable ? 'w3-text-green' : 'w3-text-red';

    const borrowerCell: string = book.borrowedBy ?
        `<span>Читатель #${book.borrowedBy}</span>` :
        '—';

    let returnDateCell: string = '—';
    if (book.returnDate) {
        const isOverdue: boolean = new Date(book.returnDate) < new Date();
        const returnDate: string = new Date(book.returnDate).toLocaleDateString('ru-RU');
        const colorClass: string = isOverdue ? 'w3-text-red' : 'w3-text-blue';
        returnDateCell = `<span class="${colorClass}">${returnDate}</span>`;
    }

    const deleteBtn: string = userRole === 'admin' ? `
        <button class="w3-button w3-small w3-red w3-round-large delete-book-btn" data-id="${book.id}">
            <i class="fas fa-trash"></i> Удалить
        </button>
    ` : '';

    return `
        <tr>
            <td>${escapeHtml(book.title)}</td>
            <td>${escapeHtml(book.author)}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>${borrowerCell}</td>
            <td>${returnDateCell}</td>
            <td>
                <div class="action-buttons">
                    <a class="w3-button w3-small w3-blue w3-round-large" href="/books/${book.id}">
                        <i class="fas fa-eye"></i> Открыть
                    </a>
                    ${deleteBtn}
                </div>
            </td>
        </tr>
    `;
}

/**
 * Экранирует HTML-символы в тексте.
 * @param {string} text - Текст для экранирования
 * @returns {string} Экранированный текст
 */
function escapeHtml(text: string): string {
    const div: HTMLDivElement = document.createElement('div') as HTMLDivElement;
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Открывает модальное окно добавления книги.
 * @returns {void}
 */
(window as any).openAddDialog = (): void => {
    addBookDialog.showModal();
};

addBookForm.addEventListener('submit', async (e: Event): Promise<void> => {
    e.preventDefault();
    const formData = new FormData(addBookForm);
    const data = Object.fromEntries(formData) as Record<string, string>;

    const publishDateStr: string | undefined = data.publishDate;
    if (!publishDateStr) {
        alert('Дата выпуска обязательна');
        return;
    }

    const publishDate = new Date(publishDateStr);
    const minDate = new Date('1000-01-01');
    const maxDate = new Date();

    if (publishDate < minDate || publishDate > maxDate) {
        alert('Дата выпуска должна быть между 1000 годом и сегодняшним днём');
        return;
    }

    try {
        const res: Response = await fetch('/books', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Ошибка при добавлении книги');
        }

        location.reload();
    } catch (err: any) {
        alert(err.message);
    }
});

/**
 * Удаляет книгу по ID.
 * @async
 * @param {HTMLButtonElement} button - Кнопка удаления с data-id
 * @returns {Promise<void>}
 */
(window as any).deleteBook = async (button: HTMLButtonElement): Promise<void> => {
    if (!confirm('Удалить эту книгу?')) {
        return;
    }
    const {id} = button.dataset;
    if (!id) {
        return;
    }

    try {
        const res: Response = await fetch(`/books/${id}`, {method: 'DELETE'});
        if (res.ok) {
            location.reload();
        } else {
            throw new Error('Ошибка при удалении');
        }
    } catch (err: any) {
        alert(err.message);
    }
};

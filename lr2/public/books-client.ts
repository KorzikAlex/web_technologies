// Элементы DOM
const statusFilter = document.getElementById('statusFilter') as HTMLSelectElement;
const dateFilter = document.getElementById('dateFilter') as HTMLInputElement;
const clearFiltersBtn = document.getElementById('clearFilters') as HTMLButtonElement;
const booksList = document.getElementById('booksList') as HTMLDivElement;
const addBookDialog = document.getElementById('addBookDialog') as HTMLDialogElement;
const addBookForm = document.getElementById('addBookForm') as HTMLFormElement;

import type {Book, BookStatus} from '../data/models/Book.ts';
import type {User} from '../data/models/User.ts';

// Фильтрация через AJAX
statusFilter.addEventListener('change', filterBooks);
dateFilter.addEventListener('change', filterBooks);
clearFiltersBtn.addEventListener('click', () => {
    statusFilter.value = 'all';
    dateFilter.value = '';
    filterBooks();
});

async function filterBooks(): Promise<void> {
    const status = statusFilter.value;
    const returnDate = dateFilter.value;

    const params = new URLSearchParams();
    if (status !== 'all') params.append('status', status);
    if (returnDate) params.append('returnDate', returnDate);

    try {
        const res: Response = await fetch(`/books/api?${params}`);
        if (!res.ok) throw new Error('Ошибка при загрузке книг');

        const books: Book[] = await res.json();
        renderBooks(books);
    } catch (err) {
        console.error(err);
        alert('Ошибка при фильтрации книг');
    }
}

function renderBooks(books: Book[]): void {
    if (books.length === 0) {
        booksList.innerHTML = '<p class="w3-center w3-text-grey">Книги не найдены</p>';
        return;
    }

    booksList.innerHTML = books.map(book => {
        const statusClass: 'w3-green' | 'w3-red' = book.isAvailable ? 'w3-green' : 'w3-red';
        const statusText: 'В наличии' | 'Выдано' = book.isAvailable ? 'В наличии' : 'Выдано';
        const publishDate: string = new Date(book.publishDate).toLocaleDateString('ru-RU');

        return `
            <div class="w3-card w3-white w3-margin-bottom">
                <div class="w3-container w3-padding">
                    <div class="w3-row">
                        <div class="w3-col" style="width:80%">
                            <h4 class="w3-margin-top">
                                <a href="/books/${book.id}">${escapeHtml(book.title)}</a>
                            </h4>
                            <p class="w3-text-grey">
                                <i class="fas fa-user"></i> ${escapeHtml(book.author)}
                            </p>
                            <p class="w3-text-grey">
                                <i class="fas fa-calendar"></i> ${publishDate}
                            </p>
                            <span class="w3-tag ${statusClass}">${statusText}</span>
                            ${renderBorrowInfo(book)}
                        </div>
                        <div class="w3-rest">
                            ${renderAdminButtons(book)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderBorrowInfo(book: Book): string {
    if (book.isAvailable) return '';

    let html: string = '';
    if (book.returnDate) {
        const isOverdue: boolean = new Date(book.returnDate) < new Date();
        const returnDate: string = new Date(book.returnDate).toLocaleDateString('ru-RU');
        const colorClass: 'w3-text-red' | 'w3-text-blue' = isOverdue ? 'w3-text-red' : 'w3-text-blue';
        html += `<span class="w3-margin-left ${colorClass}">
            <i class="fas fa-clock"></i> до ${returnDate}
        </span>`;
    }
    return html;
}

function renderAdminButtons(book: Book): string {
    // Проверка роли пользователя (можно передать через data-атрибут)
    const userRole: string | undefined = document.body.dataset.userRole;
    if (userRole !== 'admin') return '';

    return `
        <button class="w3-button w3-red w3-right" onclick="deleteBook(${book.id})">
            <i class="fas fa-trash"></i>
        </button>
    `;
}

function escapeHtml(text: string): string {
    const div: HTMLDivElement = document.createElement('div') as HTMLDivElement;
    div.textContent = text;
    return div.innerHTML;
}

// Модальное окно добавления книги
(window as any).openAddDialog = (): void => {
    addBookDialog.showModal();
};

addBookForm.addEventListener('submit', async (e: Event): Promise<void> => {
    e.preventDefault();
    const formData = new FormData(addBookForm);
    const data = Object.fromEntries(formData) as Record<string, string>;

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

// Удаление книги
(window as any).deleteBook = async (id: number): Promise<void> => {
    if (!confirm('Удалить эту книгу?')) return;

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

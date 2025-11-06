import '../public/scss/style.scss';
import type {User} from '../models/User';
import { Modal } from "bootstrap";

// Интерфейсы для типизации
interface UserFormData {
    fullName: string;
    email: string;
    username: string;
    password: string;
    birthDate: string;
}

let deleteConfirmModal: Modal;
let userIdToDelete: number | null = null;
let allUsers: User[] = [];
const currentFilters: { [key: string]: string } = {
    role: '',
    status: ''
};

// Загрузка пользователей при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    deleteConfirmModal = new Modal(document.getElementById('deleteConfirmModal')!);
    await loadUsers();
    setupEventListeners();
});

// Загрузка списка пользователей
async function loadUsers(): Promise<void> {
    try {
        const response: Response = await fetch('/users/api/users');
        allUsers = await response.json();
        renderUsers();
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
    }
}

// Отрисовка пользователей в таблице
function renderUsers(): void {
    const tbody: HTMLElement = document.getElementById('usersTableBody');
    if (!tbody) {
        return;
    }

    const filteredUsers = allUsers.filter(user => {
        const roleMatch = currentFilters.role ? user.role === currentFilters.role : true;
        const statusMatch = currentFilters.status ? user.status === currentFilters.status : true;
        return roleMatch && statusMatch;
    });

    tbody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>
                <img src="${user.avatar || '/public/assets/default-avatar.png'}" alt="${user.fullName}">
            </td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${new Date(user.birthDate).toLocaleDateString('ru-RU')}</td>
            <td>
                <span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'}">
                    ${user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(user.status)}">
                    ${getStatusText(user.status)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary edit-user" data-id="${user.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}">
                    <i class="bi bi-trash"></i>
                </button>
                <a href="/users/${user.id}/friends" class="btn btn-sm btn-info" title="Друзья пользователя">
                    <i class="bi bi-people"></i>
                </a>
            </td>
        </tr>
    `).join('');

    setupTableEventListeners();
}

// Получение класса badge для статуса
function getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
        'pending': 'bg-warning',
        'active': 'bg-success',
        'blocked': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
}

// Получение текста статуса
function getStatusText(status: string): string {
    const texts: Record<string, string> = {
        'pending': 'Не подтверждён',
        'active': 'Активный',
        'blocked': 'Заблокирован'
    };
    return texts[status] || status;
}

// Настройка обработчиков событий для таблицы
function setupTableEventListeners(): void {
    // Редактирование
    document.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = (e.currentTarget as HTMLElement).dataset.id;
            if (id) {
                await openEditModal(parseInt(id));
            }
        });
    });

    // Удаление
    document.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = (e.currentTarget as HTMLElement).dataset.id;
            if (id) {
                userIdToDelete = parseInt(id, 10);
                deleteConfirmModal.show();
            }
        });
    });
}

// Настройка основных обработчиков событий
function setupEventListeners(): void {
    const addUserBtn = document.getElementById('addUserBtn');
    const saveUserBtn = document.getElementById('saveUserBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    addUserBtn?.addEventListener('click', handleAddUser);
    saveUserBtn?.addEventListener('click', handleEditUser);

    confirmDeleteBtn?.addEventListener('click', async () => {
        if (userIdToDelete !== null) {
            await deleteUser(userIdToDelete);
        }
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.currentTarget as HTMLElement;
            const filterType = target.dataset.filterType;
            const filterValue = target.dataset.filterValue;

            if (filterType && filterValue !== undefined) {
                currentFilters[filterType] = filterValue;

                const dropdownButton = target.closest('.dropdown')?.querySelector('.dropdown-toggle');
                if (dropdownButton) {
                    const originalLabel = (target.closest('.dropdown-menu')?.getAttribute('aria-labelledby') || '').toString();
                    const buttonElement = document.getElementById(originalLabel);
                    if(buttonElement) {
                        const baseText = buttonElement.textContent.split(':')[0];
                        dropdownButton.textContent = `${baseText}: ${target.textContent}`;
                    }
                }
                renderUsers();
            }
        });
    });
}

// Открытие модального окна редактирования
async function openEditModal(id: number): Promise<void> {
    try {
        const response = await fetch(`/users/api/users/${id}`);
        const user: User = await response.json();

        (document.getElementById('editUserId') as HTMLInputElement).value = user.id.toString();
        (document.getElementById('editFullName') as HTMLInputElement).value = user.fullName;
        (document.getElementById('editEmail') as HTMLInputElement).value = user.email;
        (document.getElementById('editBirthDate') as HTMLInputElement).value = user.birthDate;
        (document.getElementById('editRole') as HTMLSelectElement).value = user.role;
        (document.getElementById('editStatus') as HTMLSelectElement).value = user.status;

        const modal = new Modal(document.getElementById('editUserModal')!);
        modal.show();
    } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
    }
}

// Обработка добавления пользователя
async function handleAddUser(): Promise<void> {
    const form = document.getElementById('addUserForm') as HTMLFormElement;
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData: UserFormData = {
        fullName: (document.getElementById('addFullName') as HTMLInputElement).value,
        email: (document.getElementById('addEmail') as HTMLInputElement).value,
        username: (document.getElementById('addUsername') as HTMLInputElement).value,
        password: (document.getElementById('addPassword') as HTMLInputElement).value,
        birthDate: (document.getElementById('addBirthDate') as HTMLInputElement).value
    };

    try {
        const response = await fetch('/users/api/users', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            Modal.getInstance(document.getElementById('addUserModal')!)?.hide();
            form.reset();
            await loadUsers();
        }
    } catch (error) {
        console.error('Ошибка добавления пользователя:', error);
    }
}

// Обработка редактирования пользователя
async function handleEditUser(): Promise<void> {
    const id = (document.getElementById('editUserId') as HTMLInputElement).value;
    const updates = {
        fullName: (document.getElementById('editFullName') as HTMLInputElement).value,
        email: (document.getElementById('editEmail') as HTMLInputElement).value,
        birthDate: (document.getElementById('editBirthDate') as HTMLInputElement).value,
        role: (document.getElementById('editRole') as HTMLSelectElement).value,
        status: (document.getElementById('editStatus') as HTMLSelectElement).value
    };

    try {
        const response = await fetch(`/users/api/users/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updates)
        });

        if (response.ok) {
            Modal.getInstance(document.getElementById('editUserModal')!)?.hide();
            await loadUsers();
        }
    } catch (error) {
        console.error('Ошибка обновления пользователя:', error);
    }
}

async function deleteUser(id: number): Promise<void> {
    try {
        const response = await fetch(`/users/api/users/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            deleteConfirmModal.hide(); // Скрываем модальное окно при успехе
            await loadUsers();
        } else {
            // Можно добавить обработку ошибок, если удаление не удалось
            alert('Не удалось удалить пользователя.');
        }
    } catch (error) {
        console.error('Ошибка удаления пользователя:', error);
    } finally {
        userIdToDelete = null; // Сбрасываем ID
    }
}

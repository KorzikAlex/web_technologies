import '../public/scss/style.scss';
import { Modal } from "bootstrap";
let deleteConfirmModal;
let userIdToDelete = null;
let allUsers = [];
const currentFilters = {
    role: '',
    status: ''
};
// Загрузка пользователей при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    const deleteModalElement = document.getElementById('deleteConfirmModal');
    if (deleteModalElement) {
        deleteConfirmModal = Modal.getOrCreateInstance(deleteModalElement);
    }
    await loadUsers();
    setupEventListeners();
});
// Загрузка списка пользователей
async function loadUsers() {
    try {
        const response = await fetch('/users/api/users');
        allUsers = await response.json();
        renderUsers();
    }
    catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
    }
}
// Отрисовка пользователей в таблице
function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) {
        return;
    }
    const filteredUsers = allUsers.filter(user => {
        const roleMatch = currentFilters.role ? user.role === currentFilters.role : true;
        const statusMatch = currentFilters.status ? user.status === currentFilters.status : true;
        return roleMatch && statusMatch;
    });
    tbody.innerHTML = filteredUsers.map(user => {
        // Формируем полное имя для alt текста
        const fullName = user.patronymic
            ? `${user.surname} ${user.name} ${user.patronymic}`
            : `${user.surname} ${user.name}`;
        return `
        <tr>
            <td>
                <img src="${user.avatar || '/public/assets/default-avatar.png'}" alt="${fullName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;">
            </td>
            <td>${user.surname}</td>
            <td>${user.name}</td>
            <td>${user.patronymic || '—'}</td>
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
                <a href="/posts/feed/${user.id}" class="btn btn-sm btn-success" title="Лента новостей">
                    <i class="bi bi-newspaper"></i>
                </a>
            </td>
        </tr>
    `;
    }).join('');
    setupTableEventListeners();
}
// Получение класса badge для статуса
function getStatusBadgeClass(status) {
    const classes = {
        'pending': 'bg-warning',
        'active': 'bg-success',
        'blocked': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
}
// Получение текста статуса
function getStatusText(status) {
    const texts = {
        'pending': 'Не подтверждён',
        'active': 'Активный',
        'blocked': 'Заблокирован'
    };
    return texts[status] || status;
}
// Настройка обработчиков событий для таблицы
function setupTableEventListeners() {
    // Редактирование
    document.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.id;
            if (id) {
                await openEditModal(parseInt(id));
            }
        });
    });
    // Удаление
    document.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.id;
            if (id) {
                userIdToDelete = parseInt(id, 10);
                deleteConfirmModal.show();
            }
        });
    });
}
// Настройка основных обработчиков событий
function setupEventListeners() {
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
            const target = e.currentTarget;
            const filterType = target.dataset.filterType;
            const filterValue = target.dataset.filterValue;
            if (filterType && filterValue !== undefined) {
                currentFilters[filterType] = filterValue;
                const dropdownButton = target.closest('.dropdown')?.querySelector('.dropdown-toggle');
                if (dropdownButton) {
                    const originalLabel = (target.closest('.dropdown-menu')?.getAttribute('aria-labelledby') || '').toString();
                    const buttonElement = document.getElementById(originalLabel);
                    if (buttonElement) {
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
async function openEditModal(id) {
    try {
        const response = await fetch(`/users/api/users/${id}`);
        const user = await response.json();
        document.getElementById('editUserId').value = user.id.toString();
        document.getElementById('editAvatar').value = user.avatar || '';
        document.getElementById('editSurname').value = user.surname;
        document.getElementById('editName').value = user.name;
        document.getElementById('editPatronymic').value = user.patronymic || '';
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editBirthDate').value = user.birthDate;
        document.getElementById('editRole').value = user.role;
        document.getElementById('editStatus').value = user.status;
        const modal = new Modal(document.getElementById('editUserModal'));
        modal.show();
    }
    catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
    }
}
// Обработка добавления пользователя
async function handleAddUser() {
    const form = document.getElementById('addUserForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    const formData = {
        surname: document.getElementById('addSurname').value,
        name: document.getElementById('addName').value,
        patronymic: document.getElementById('addPatronymic').value || undefined,
        email: document.getElementById('addEmail').value,
        username: document.getElementById('addUsername').value,
        password: document.getElementById('addPassword').value,
        birthDate: document.getElementById('addBirthDate').value,
        avatar: document.getElementById('addAvatar').value || undefined
    };
    try {
        const response = await fetch('/users/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (response.ok) {
            Modal.getInstance(document.getElementById('addUserModal'))?.hide();
            form.reset();
            await loadUsers();
        }
    }
    catch (error) {
        console.error('Ошибка добавления пользователя:', error);
    }
}
// Обработка редактирования пользователя
async function handleEditUser() {
    const id = document.getElementById('editUserId').value;
    const updates = {
        surname: document.getElementById('editSurname').value,
        name: document.getElementById('editName').value,
        patronymic: document.getElementById('editPatronymic').value || undefined,
        email: document.getElementById('editEmail').value,
        birthDate: document.getElementById('editBirthDate').value,
        role: document.getElementById('editRole').value,
        status: document.getElementById('editStatus').value,
        avatar: document.getElementById('editAvatar').value || undefined
    };
    try {
        const response = await fetch(`/users/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (response.ok) {
            Modal.getInstance(document.getElementById('editUserModal'))?.hide();
            await loadUsers();
        }
    }
    catch (error) {
        console.error('Ошибка обновления пользователя:', error);
    }
}
async function deleteUser(id) {
    try {
        const response = await fetch(`/users/api/users/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            deleteConfirmModal.hide(); // Скрываем модальное окно при успехе
            await loadUsers();
        }
        else {
            // Можно добавить обработку ошибок, если удаление не удалось
            alert('Не удалось удалить пользователя.');
        }
    }
    catch (error) {
        console.error('Ошибка удаления пользователя:', error);
    }
    finally {
        userIdToDelete = null; // Сбрасываем ID
    }
}

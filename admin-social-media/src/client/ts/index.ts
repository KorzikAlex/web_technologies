// import '@scss/style.scss';
import { Modal } from 'bootstrap';

import type {User} from '../models/User.js';

function parseUserDates(user: any): User {
    return {
        ...user,
        birthday: new Date(user.birthday),
        createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
    };
}

function getRoleBadge(role: string): string {
    const roleText = role === 'admin' ? 'Администратор' : 'Пользователь';
    const badgeClass = role === 'admin' ? 'badge bg-danger' : 'badge bg-primary';
    return `<span class="${badgeClass}">${roleText}</span>`;
}

function getStatusBadge(status: string): string {
    let statusText: string;
    let badgeClass: string;
    switch (status) {
        case 'active':
            statusText = 'Активный';
            badgeClass = 'badge bg-success';
            break;
        case 'unconfirmed':
            statusText = 'Не подтверждён';
            badgeClass = 'badge bg-warning';
            break;
        case 'banned':
            statusText = 'Заблокирован';
            badgeClass = 'badge bg-secondary';
            break;
        default:
            statusText = status;
            badgeClass = 'badge bg-light';
    }
    return `<span class="${badgeClass}">${statusText}</span>`;
}

async function fetchUsers(): Promise<User[]> {
    try {
        const response = await fetch('https://localhost:3000/users');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        allUsers = users.map(parseUserDates); // Store all users for filtering
        return allUsers;
    } catch (error) {
        console.error("Could not fetch users:", error);
        return [];
    }
}

function renderUsers(users: User[]): void {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = ''; // Clear existing rows

    users.forEach(user => {
        const avatarHtml = user.avatarPath ? `<img src="${user.avatarPath}" alt="Avatar" class="rounded-circle" style="width: 50px; height: 50px;">` : `<i class="bi bi-person-circle text-muted" style="font-size: 50px;"></i>`;
        const fullName = `${user.name} ${user.surname} ${user.patronymic || ''}`.trim();
        const birthday = user.birthday.toLocaleDateString();
        const createdAt = user.createdAt ? user.createdAt.toLocaleString() : 'N/A';
        const updatedAt = user.updatedAt ? user.updatedAt.toLocaleString() : 'Никогда';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center align-middle">${user.id}</td>
            <td class="text-center align-middle">${avatarHtml}</td>
            <td class="text-center align-middle">${user.username}</td>
            <td class="text-center align-middle">${fullName}</td>
            <td class="text-center align-middle">${user.email}</td>
            <td class="text-center align-middle">${birthday}</td>
            <td class="text-center align-middle">${getRoleBadge(user.role)}</td>
            <td class="text-center align-middle">${getStatusBadge(user.status)}</td>
            <td class="text-center align-middle">${createdAt}</td>
            <td class="text-center align-middle">${updatedAt}</td>
            <td class="text-center align-middle">
                <div class="d-flex flex-column gap-2 d-sm-inline-flex d-sm-flex-row">
                    <button class="btn btn-sm btn-primary edit-btn" data-id="${user.id}">Редактировать</button>
                    <button class="btn btn-sm btn-info friends-btn" data-id="${user.id}">Друзья</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id}">Удалить</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function loadUsers(): Promise<void> {
    const users = await fetchUsers();
    renderUsers(users);
    applyFilters(); // Apply filters after loading
}

let allUsers: User[] = [];
let currentRoleFilter: string = '';
let currentStatusFilter: string = '';

function applyFilters(): void {
    let filteredUsers = allUsers;

    if (currentRoleFilter) {
        filteredUsers = filteredUsers.filter(user => user.role === currentRoleFilter);
    }

    if (currentStatusFilter) {
        filteredUsers = filteredUsers.filter(user => user.status === currentStatusFilter);
    }

    renderUsers(filteredUsers);
    updateFilterButtons();
}

function updateFilterButtons(): void {
    // Update role filter button
    const roleTextSpan = document.getElementById('roleFilterText');
    if (roleTextSpan) {
        if (currentRoleFilter) {
            const roleText = currentRoleFilter === 'admin' ? 'Администратор' : 'Пользователь';
            roleTextSpan.textContent = `Фильтр по роли: ${roleText}`;
        } else {
            roleTextSpan.textContent = 'Фильтр по роли';
        }
    }

    // Update status filter button
    const statusTextSpan = document.getElementById('statusFilterText');
    if (statusTextSpan) {
        if (currentStatusFilter) {
            const statusText = currentStatusFilter === 'active' ? 'Активный' : currentStatusFilter === 'unconfirmed' ? 'Не подтверждён' : 'Заблокирован';
            statusTextSpan.textContent = `Фильтр по статусу: ${statusText}`;
        } else {
            statusTextSpan.textContent = 'Фильтр по статусу';
        }
    }

    // Show/hide reset button
    const resetBtn = document.getElementById('resetFiltersBtn');
    if (resetBtn) {
        if (currentRoleFilter || currentStatusFilter) {
            resetBtn.classList.remove('d-none');
        } else {
            resetBtn.classList.add('d-none');
        }
    }
}

async function editUser(userId: number): Promise<void> {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    (document.getElementById('editAvatar') as HTMLInputElement).value = user.avatarPath || '';
    (document.getElementById('editSurname') as HTMLInputElement).value = user.surname;
    (document.getElementById('editName') as HTMLInputElement).value = user.name;
    (document.getElementById('editPatronymic') as HTMLInputElement).value = user.patronymic || '';
    (document.getElementById('editUsername') as HTMLInputElement).value = user.username;
    (document.getElementById('editEmail') as HTMLInputElement).value = user.email;
    (document.getElementById('editPassword') as HTMLInputElement).value = '';
    (document.getElementById('editBirthday') as HTMLInputElement).valueAsDate = user.birthday!;
    (document.getElementById('editRole') as HTMLSelectElement).value = user.role;
    (document.getElementById('editStatus') as HTMLSelectElement).value = user.status;

    const editModalElement = document.getElementById('editUserModal');
    if (editModalElement) {
        const editModal = new Modal(editModalElement);
        editModal.show();

        const saveBtn = document.getElementById('saveUserBtn');
        saveBtn?.addEventListener('click', async () => {
            const password = (document.getElementById('editPassword') as HTMLInputElement).value;
            const updatedUser: any = {
                avatarPath: (document.getElementById('editAvatar') as HTMLInputElement).value || undefined,
                surname: (document.getElementById('editSurname') as HTMLInputElement).value,
                name: (document.getElementById('editName') as HTMLInputElement).value,
                patronymic: (document.getElementById('editPatronymic') as HTMLInputElement).value || undefined,
                username: (document.getElementById('editUsername') as HTMLInputElement).value,
                email: (document.getElementById('editEmail') as HTMLInputElement).value,
                birthday: new Date((document.getElementById('editBirthday') as HTMLInputElement).value),
                role: (document.getElementById('editRole') as HTMLSelectElement).value,
                status: (document.getElementById('editStatus') as HTMLSelectElement).value,
            };
            if (password) {
                updatedUser.passwordHash = password; // In a real app, hash it
            }

            try {
                const response = await fetch(`https://localhost:3000/users/${userId}`, {
                    method: 'POST', // Note: Server uses POST for update
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedUser),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                editModal.hide();
                await loadUsers(); // Refresh the user list

            } catch (error) {
                console.error('Failed to update user:', error);
            }
        }, { once: true }); // Use once to avoid multiple listeners
    }
}

async function deleteUser(userId: number): Promise<void> {
    const deleteModalElement = document.getElementById('deleteConfirmModal');
    if (deleteModalElement) {
        const deleteModal = new Modal(deleteModalElement);
        deleteModal.show();

        const confirmBtn = document.getElementById('confirmDeleteBtn');
        confirmBtn?.addEventListener('click', async () => {
            try {
                const response = await fetch(`https://localhost:3000/users/${userId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                deleteModal.hide();
                await loadUsers(); // Refresh the user list

            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }, { once: true });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();

    // Filter buttons
    document.querySelectorAll('.dropdown-item[data-filter-type]').forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            const target = event.target as HTMLElement;
            const filterType = target.getAttribute('data-filter-type');
            const filterValue = target.getAttribute('data-filter-value');

            if (filterType === 'role') {
                currentRoleFilter = filterValue || '';
            } else if (filterType === 'status') {
                currentStatusFilter = filterValue || '';
            }

            applyFilters();
        });
    });

    // Edit and delete buttons
    const tableBody = document.getElementById('usersTableBody');
    tableBody?.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('edit-btn')) {
            const userId = parseInt(target.getAttribute('data-id')!);
            editUser(userId);
        } else if (target.classList.contains('friends-btn')) {
            const userId = parseInt(target.getAttribute('data-id')!);
            window.location.href = `/friends/${userId}`;
        } else if (target.classList.contains('delete-btn')) {
            const userId = parseInt(target.getAttribute('data-id')!);
            deleteUser(userId);
        }
    });

    // Reset filters button
    const resetBtn = document.getElementById('resetFiltersBtn');
    resetBtn?.addEventListener('click', () => {
        currentRoleFilter = '';
        currentStatusFilter = '';
        applyFilters();
    });

    const addUserForm = document.getElementById('addUserForm');
    const addUserBtn = document.getElementById('addUserBtn');
    const addUserModalElement = document.getElementById('addUserModal');

    if (addUserModalElement) {
        const addUserModal = new Modal(addUserModalElement);

        addUserBtn?.addEventListener('click', async (event) => {
            event.preventDefault();

            const form = addUserForm as HTMLFormElement;
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const newUser = {
                avatarPath: (document.getElementById('addAvatar') as HTMLInputElement).value,
                surname: (document.getElementById('addSurname') as HTMLInputElement).value,
                name: (document.getElementById('addName') as HTMLInputElement).value,
                patronymic: (document.getElementById('addPatronymic') as HTMLInputElement).value,
                email: (document.getElementById('addEmail') as HTMLInputElement).value,
                username: (document.getElementById('addUsername') as HTMLInputElement).value,
                passwordHash: (document.getElementById('addPassword') as HTMLInputElement).value, // In a real app, you'd hash this
                birthday: new Date((document.getElementById('addBirthDate') as HTMLInputElement).value),
                role: (document.getElementById('addRole') as HTMLSelectElement).value,
            };

            try {
                const response = await fetch('https://localhost:3000/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newUser),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                form.reset();
                addUserModal.hide();
                await loadUsers(); // Refresh the user list

            } catch (error) {
                console.error('Failed to add user:', error);
                // Here you could show an error message to the user
            }
        });
    }
});

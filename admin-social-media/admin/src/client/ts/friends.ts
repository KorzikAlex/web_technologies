// import '@scss/style.scss';
import { Modal } from 'bootstrap';

import type {User} from '../../shared/models/User.js';

const userId = parseInt(window.location.pathname.split('/').pop() || '0');

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

async function fetchFriends(): Promise<User[]> {
    try {
        const response = await fetch(`https://localhost:3000/users/${userId}/friends`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const friends = await response.json();
        return friends.map(parseUserDates);
    } catch (error) {
        console.error("Could not fetch friends:", error);
        return [];
    }
}

async function fetchAllUsers(): Promise<User[]> {
    try {
        const response = await fetch('https://localhost:3000/users');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        return users.map(parseUserDates);
    } catch (error) {
        console.error("Could not fetch users:", error);
        return [];
    }
}

function renderFriends(friends: User[]): void {
    const tableBody = document.getElementById('friendsTableBody');
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = '';

    friends.forEach(friend => {
        const avatarHtml = friend.avatarPath ? `<img src="${friend.avatarPath}" alt="Avatar" class="rounded-circle" style="width: 50px; height: 50px;">` : `<i class="bi bi-person-circle text-muted" style="font-size: 50px;"></i>`;
        const fullName = `${friend.name} ${friend.surname} ${friend.patronymic || ''}`.trim();
        const birthday = friend.birthday.toLocaleDateString();

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center align-middle">${friend.id}</td>
            <td class="text-center align-middle">${avatarHtml}</td>
            <td class="text-center align-middle">${friend.username}</td>
            <td class="text-center align-middle">${fullName}</td>
            <td class="text-center align-middle">${friend.email}</td>
            <td class="text-center align-middle">${birthday}</td>
            <td class="text-center align-middle">${getRoleBadge(friend.role)}</td>
            <td class="text-center align-middle">${getStatusBadge(friend.status)}</td>
            <td class="text-center align-middle">
                <div class="d-flex flex-column gap-2 d-sm-inline-flex d-sm-flex-row">
                    <button class="btn btn-sm btn-info view-btn" data-id="${friend.id}">Просмотр</button>
                    <button class="btn btn-sm btn-danger remove-btn" data-id="${friend.id}">Удалить</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function loadFriends(): Promise<void> {
    const friends = await fetchFriends();
    renderFriends(friends);
}

async function addFriend(friendId: number): Promise<void> {
    try {
        const response = await fetch(`https://localhost:3000/users/${userId}/friends/${friendId}`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        await loadFriends();
    } catch (error) {
        console.error('Failed to add friend:', error);
    }
}

async function removeFriend(friendId: number): Promise<void> {
    try {
        const response = await fetch(`https://localhost:3000/users/${userId}/friends/${friendId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        await loadFriends();
    } catch (error) {
        console.error('Failed to remove friend:', error);
    }
}

function viewUser(user: User): void {
    const modalBody = document.getElementById('userInfoBody');
    if (modalBody) {
        const avatarHtml = user.avatarPath ? `<img src="${user.avatarPath}" alt="Avatar" class="rounded-circle mb-3" style="width: 100px; height: 100px;">` : `<i class="bi bi-person-circle text-muted mb-3" style="font-size: 100px;"></i>`;
        const fullName = `${user.name} ${user.surname} ${user.patronymic || ''}`.trim();
        const birthday = user.birthday.toLocaleDateString();
        const createdAt = user.createdAt ? user.createdAt.toLocaleString() : 'N/A';
        const updatedAt = user.updatedAt ? user.updatedAt.toLocaleString() : 'Никогда';

        modalBody.innerHTML = `
            <div class="text-center">${avatarHtml}</div>
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Имя пользователя:</strong> ${user.username}</p>
            <p><strong>ФИО:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Дата рождения:</strong> ${birthday}</p>
            <p><strong>Роль:</strong> ${getRoleBadge(user.role)}</p>
            <p><strong>Статус:</strong> ${getStatusBadge(user.status)}</p>
            <p><strong>Дата регистрации:</strong> ${createdAt}</p>
            <p><strong>Обновлено:</strong> ${updatedAt}</p>
        `;

        const viewModalElement = document.getElementById('viewUserModal');
        if (viewModalElement) {
            const viewModal = new Modal(viewModalElement);
            viewModal.show();
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!userId) {
        alert('User ID not provided');
        return;
    }

    await loadFriends();

    // Back button
    const backBtn = document.getElementById('backBtn');
    backBtn?.addEventListener('click', () => {
        window.location.href = '/';
    });

    // Add friend modal
    const addFriendModalElement = document.getElementById('addFriendModal');
    const addFriendBtn = document.getElementById('addFriendBtn');
    const addFriendSelect = document.getElementById('addFriendSelect') as HTMLSelectElement;

    if (addFriendModalElement && addFriendSelect) {
        const addFriendModal = new Modal(addFriendModalElement);

        // Populate select with users not friends
        addFriendModalElement.addEventListener('show.bs.modal', async () => {
            const allUsers = await fetchAllUsers();
            const friends = await fetchFriends();
            const friendIds = friends.map(f => f.id);
            const availableUsers = allUsers.filter(u => u.id !== userId && !friendIds.includes(u.id));

            addFriendSelect.innerHTML = '<option value="">Выберите пользователя</option>';
            availableUsers.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id.toString();
                option.textContent = `${user.name} ${user.surname} (${user.username})`;
                addFriendSelect.appendChild(option);
            });
        });

        addFriendBtn?.addEventListener('click', async () => {
            const selectedId = parseInt(addFriendSelect.value);
            if (selectedId) {
                await addFriend(selectedId);
                addFriendModal.hide();
            }
        });
    }

    // Table actions
    const tableBody = document.getElementById('friendsTableBody');
    tableBody?.addEventListener('click', async (event) => {
        const target = event.target as HTMLElement;
        const friendId = parseInt(target.getAttribute('data-id') || '0');

        if (target.classList.contains('view-btn')) {
            const friends = await fetchFriends();
            const friend = friends.find(f => f.id === friendId);
            if (friend) {
                viewUser(friend);
            }
        } else if (target.classList.contains('remove-btn')) {
            const removeModalElement = document.getElementById('removeFriendModal');
            if (removeModalElement) {
                const removeModal = new Modal(removeModalElement);
                removeModal.show();

                const confirmBtn = document.getElementById('confirmRemoveBtn');
                confirmBtn?.addEventListener('click', async () => {
                    await removeFriend(friendId);
                    removeModal.hide();
                }, { once: true });
            }
        }
    });
});
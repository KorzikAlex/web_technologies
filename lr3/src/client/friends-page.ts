import '../public/scss/style.scss';
import type {User} from '../models/User.js';
import {Modal} from 'bootstrap';

let allFriends: User[] = [];
let allUsers: User[] = [];
let currentUserId: number | null = null;
let addFriendModal: Modal | null = null;
let removeFriendModal: Modal | null = null;
let friendIdToRemove: number | null = null;

document.addEventListener('DOMContentLoaded', async () => {
    const pathParts = window.location.pathname.split('/');
    const userIdIndex = pathParts.indexOf('users') + 1;
    if (userIdIndex > 0 && userIdIndex < pathParts.length) {
        currentUserId = parseInt(pathParts[userIdIndex], 10);
    }

    if (!currentUserId) {
        console.error('Не удалось определить ID пользователя');
        return;
    }

    const modalElement = document.getElementById('addFriendModal');
    if (modalElement) {
        addFriendModal = Modal.getOrCreateInstance(modalElement);
        modalElement.addEventListener('shown.bs.modal', loadAllUsers);
    }

    const removeModalElement = document.getElementById('removeFriendModal');
    if (removeModalElement) {
        removeFriendModal = Modal.getOrCreateInstance(removeModalElement);
    }

    await loadFriends();
    setupEventListeners();
});

async function loadFriends(): Promise<void> {
    if (!currentUserId) return;
    try {
        const response = await fetch(`/users/${currentUserId}/friends/api/friends`);
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        allFriends = await response.json();
        renderFriends(allFriends);
    } catch (error) {
        console.error('Ошибка загрузки друзей:', error);
        const grid = document.getElementById('friendsGrid');
        if (grid) {
            grid.innerHTML = `<div class="col-12 text-center text-danger">Не удалось загрузить список друзей.</div>`;
        }
    }
}

function renderFriends(friends: User[]): void {
    const grid = document.getElementById('friendsGrid');
    if (!grid) return;

    if (friends.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center text-muted py-5">
                <i class="bi bi-people fs-1 d-block mb-3"></i>
                <p>У этого пользователя пока нет друзей</p>
            </div>`;
        return;
    }

    grid.innerHTML = friends.map(renderFriendCard).join('');

    setupGridEventListeners();
}

function renderFriendCard(friend: User): string {
    const fullName = friend.patronymic
        ? `${friend.surname} ${friend.name} ${friend.patronymic}`
        : `${friend.surname} ${friend.name}`;

    return `
        <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
            <div class="card h-100 shadow-sm">
                <div class="card-body text-center">
                    <img class="rounded-circle mb-3"
                         src="${friend.avatar || '/public/assets/default-avatar.png'}"
                         alt="${fullName}"
                         style="width: 100px; height: 100px; object-fit: cover;">
                    <h5 class="card-title">${fullName}</h5>
                    <p class="card-text text-muted small">${friend.email}</p>
                    <div class="d-flex gap-2 justify-content-center">
                        <a class="btn btn-sm btn-outline-secondary" href="/users/${friend.id}/friends">
                            <i class="bi bi-people"></i> Друзья
                        </a>
                        <button class="btn btn-sm btn-outline-danger remove-friend" data-id="${friend.id}">
                            <i class="bi bi-person-dash"></i> Удалить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupEventListeners(): void {
    const searchInput = document.getElementById('searchFriend') as HTMLInputElement;
    searchInput?.addEventListener('input', (e) => {
        const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
        const filteredFriends = allFriends.filter(friend => {
            const fullName = friend.patronymic
                ? `${friend.surname} ${friend.name} ${friend.patronymic}`
                : `${friend.surname} ${friend.name}`;
            return fullName.toLowerCase().includes(searchTerm) ||
                friend.email.toLowerCase().includes(searchTerm);
        });
        renderFriends(filteredFriends);
    });

    const searchAllUsersInput = document.getElementById('searchAllUsers') as HTMLInputElement;
    searchAllUsersInput?.addEventListener('input', (e) => {
        const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
        const filteredUsers = allUsers.filter(user => {
            const fullName = user.patronymic
                ? `${user.surname} ${user.name} ${user.patronymic}`
                : `${user.surname} ${user.name}`;
            return fullName.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm);
        });
        renderAllUsers(filteredUsers);
    });

    // Обработчик для кнопки "К списку пользователей"
    const backToUsersBtn = document.getElementById('backToUsersBtn');
    backToUsersBtn?.addEventListener('click', () => {
        window.location.href = '/users';
    });

    // Обработчик для кнопки подтверждения удаления друга
    const confirmRemoveFriendBtn = document.getElementById('confirmRemoveFriendBtn');
    confirmRemoveFriendBtn?.addEventListener('click', async () => {
        if (friendIdToRemove !== null) {
            await removeFriend(friendIdToRemove);
            removeFriendModal?.hide();
            friendIdToRemove = null;
        }
    });
}

function setupGridEventListeners(): void {
    document.querySelectorAll('.remove-friend').forEach(button => {
        button.addEventListener('click', async (e) => {
            const target = e.currentTarget as HTMLElement;
            const friendId = target.dataset.id;
            if (friendId) {
                friendIdToRemove = parseInt(friendId, 10);
                removeFriendModal?.show();
            }
        });
    });
}

async function removeFriend(friendId: number): Promise<void> {
    if (!currentUserId) return;
    try {
        const response = await fetch(`/users/${currentUserId}/friends/api/friends/${friendId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            await loadFriends();
        } else {
            alert('Не удалось удалить друга.');
        }
    } catch (error) {
        console.error('Ошибка при отправке запроса на удаление:', error);
    }
}

async function loadAllUsers(): Promise<void> {
    if (!currentUserId) return;
    try {
        const response = await fetch(`/users/${currentUserId}/friends/api/all-users`);
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        allUsers = await response.json();
        renderAllUsers(allUsers);
    } catch (error) {
        console.error('Ошибка загрузки всех пользователей:', error);
        const list = document.getElementById('allUsersList');
        if (list) {
            list.innerHTML = `<div class="list-group-item text-danger">Не удалось загрузить список пользователей.</div>`;
        }
    }
}

function renderAllUsers(users: User[]): void {
    const list = document.getElementById('allUsersList');
    if (!list) return;

    if (users.length === 0) {
        list.innerHTML = `<div class="list-group-item text-muted">Нет пользователей для добавления.</div>`;
        return;
    }

    list.innerHTML = users.map(user => `
        <div class="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <h6 class="mb-0">${user.fullName}</h6>
                <small class="text-muted">${user.email}</small>
            </div>
            <button class="btn btn-sm btn-success add-friend" data-id="${user.id}">
                <i class="bi bi-plus-lg"></i> Добавить
            </button>
        </div>
    `).join('');

    setupModalEventListeners();
}

function setupModalEventListeners(): void {
    document.querySelectorAll('.add-friend').forEach(button => {
        button.addEventListener('click', async (e) => {
            const target = e.currentTarget as HTMLElement;
            const friendId = target.dataset.id;
            if (friendId) {
                await addFriend(parseInt(friendId, 10));
            }
        });
    });
}

async function addFriend(friendId: number): Promise<void> {
    if (!currentUserId) return;
    try {
        const response = await fetch(`/users/${currentUserId}/friends/api/friends`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({friendId})
        });
        if (response.ok) {
            addFriendModal?.hide();
            await loadFriends();
        } else {
            alert('Не удалось добавить друга.');
        }
    } catch (error) {
        console.error('Ошибка при отправке запроса на добавление:', error);
    }
}


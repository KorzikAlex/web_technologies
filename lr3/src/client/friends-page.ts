import '../public/scss/style.scss';
import type {User} from '../models/User';

let allFriends: User[] = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadFriends();
    setupEventListeners();
});

async function loadFriends(): Promise<void> {
    try {
        const response = await fetch('/friends/api/friends');
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
                <p>У вас пока нет друзей</p>
                <p class="small">Найдите интересных людей!</p>
            </div>`;
        return;
    }

    grid.innerHTML = friends.map(friend => `
        <div class="col-md-6 col-lg-4 col-xl-3">
            <div class="card h-100 shadow-sm">
                <div class="card-body text-center">
                    <img class="rounded-circle mb-3"
                            src="${friend.avatar || '/public/assets/default-avatar.png'}"
                            alt="${friend.fullName}"
                            style="width: 100px; height: 100px; object-fit: cover;">
                    <h5 class="card-title">${friend.fullName}</h5>
                    <p class="card-text text-muted small">${friend.email}</p>
                    <div class="d-flex gap-2 justify-content-center">
                        <a class="btn btn-sm btn-primary" href="/users/${friend.id}">
                            <i class="bi bi-person"></i> Профиль
                        </a>
                        <button class="btn btn-sm btn-outline-danger remove-friend" data-id="${friend.id}">
                            <i class="bi bi-person-dash"></i> Удалить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    setupGridEventListeners();
}

function setupEventListeners(): void {
    const searchInput = document.getElementById('searchFriend') as HTMLInputElement;
    searchInput?.addEventListener('input', (e) => {
        const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
        const filteredFriends = allFriends.filter(friend =>
            friend.fullName.toLowerCase().includes(searchTerm) ||
            friend.email.toLowerCase().includes(searchTerm)
        );
        renderFriends(filteredFriends);
    });
}

function setupGridEventListeners(): void {
    document.querySelectorAll('.remove-friend').forEach(button => {
        button.addEventListener('click', async (e) => {
            const target = e.currentTarget as HTMLElement;
            const friendId = target.dataset.id;
            if (friendId && confirm('Вы уверены, что хотите удалить этого друга?')) {
                await removeFriend(parseInt(friendId, 10));
            }
        });
    });
}

async function removeFriend(friendId: number): Promise<void> {
    try {
        const response = await fetch(`/friends/api/friends/${friendId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            await loadFriends(); // Перезагружаем список друзей
        } else {
            console.error('Ошибка удаления друга:', await response.text());
            alert('Не удалось удалить друга.');
        }
    } catch (error) {
        console.error('Ошибка при отправке запроса на удаление:', error);
    }
}

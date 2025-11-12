import '../public/scss/style.scss';
import { Modal } from 'bootstrap';
let currentUserId = null;
let feedPosts = [];
let addPostModal = null;
let editPostModal = null;
let deletePostModal = null;
let postIdToDelete = null;
let postIdToEdit = null;
document.addEventListener('DOMContentLoaded', async () => {
    // Получаем userId из URL
    const pathParts = window.location.pathname.split('/');
    const userIdIndex = pathParts.indexOf('feed') + 1;
    if (userIdIndex > 0 && userIdIndex < pathParts.length) {
        currentUserId = parseInt(pathParts[userIdIndex], 10);
    }
    if (!currentUserId) {
        console.error('Не удалось определить ID пользователя');
        return;
    }
    // Инициализация модальных окон
    const addModalElement = document.getElementById('addPostModal');
    if (addModalElement) {
        addPostModal = Modal.getOrCreateInstance(addModalElement);
    }
    const editModalElement = document.getElementById('editPostModal');
    if (editModalElement) {
        editPostModal = Modal.getOrCreateInstance(editModalElement);
    }
    const deleteModalElement = document.getElementById('deletePostModal');
    if (deleteModalElement) {
        deletePostModal = Modal.getOrCreateInstance(deleteModalElement);
    }
    await loadFeed();
    setupEventListeners();
});
async function loadFeed() {
    if (!currentUserId)
        return;
    try {
        const response = await fetch(`/posts/api/feed/${currentUserId}`);
        if (!response.ok)
            throw new Error(`Ошибка HTTP: ${response.status}`);
        feedPosts = await response.json();
        renderFeed();
        updateStats();
    }
    catch (error) {
        console.error('Ошибка загрузки ленты:', error);
        const container = document.getElementById('feedContainer');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Не удалось загрузить ленту новостей
                </div>`;
        }
    }
}
function renderFeed() {
    const container = document.getElementById('feedContainer');
    if (!container)
        return;
    if (feedPosts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-newspaper fs-1 text-muted d-block mb-3"></i>
                <h4 class="text-muted">Пока нет новостей</h4>
                <p class="text-muted">Добавьте друзей или создайте свою первую новость!</p>
            </div>`;
        return;
    }
    // Мы больше не генерируем HTML на клиенте, а получаем его с сервера
    // Поэтому эта функция теперь просто вызывает attachPostEventListeners
    attachPostEventListeners();
}
function attachPostEventListeners() {
    // Редактирование
    document.querySelectorAll('.edit-post').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const postId = parseInt(e.currentTarget.dataset.id || '0', 10);
            openEditModal(postId);
        });
    });
    // Удаление
    document.querySelectorAll('.delete-post').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const postId = parseInt(e.currentTarget.dataset.id || '0', 10);
            postIdToDelete = postId;
            deletePostModal?.show();
        });
    });
}
function setupEventListeners() {
    // Кнопка "К списку пользователей"
    const backToUsersBtn = document.getElementById('backToUsersBtn');
    backToUsersBtn?.addEventListener('click', () => {
        window.location.href = '/users';
    });
    // Отправка новой новости
    const submitPostBtn = document.getElementById('submitPostBtn');
    submitPostBtn?.addEventListener('click', async () => {
        await handleAddPost();
    });
    // Сохранение отредактированной новости
    const saveEditPostBtn = document.getElementById('saveEditPostBtn');
    saveEditPostBtn?.addEventListener('click', async () => {
        await handleEditPost();
    });
    // Подтверждение удаления
    const confirmDeletePostBtn = document.getElementById('confirmDeletePostBtn');
    confirmDeletePostBtn?.addEventListener('click', async () => {
        if (postIdToDelete !== null) {
            await handleDeletePost(postIdToDelete);
            deletePostModal?.hide();
            postIdToDelete = null;
        }
    });
}
async function handleAddPost() {
    const content = document.getElementById('postContent').value.trim();
    const image = document.getElementById('postImage').value.trim();
    if (!content) {
        alert('Пожалуйста, введите содержание новости');
        return;
    }
    try {
        const response = await fetch('/posts/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                authorId: currentUserId,
                content,
                image: image || undefined
            })
        });
        if (!response.ok)
            throw new Error('Ошибка при создании новости');
        // Очистка формы
        document.getElementById('postContent').value = '';
        document.getElementById('postImage').value = '';
        addPostModal?.hide();
        await loadFeed();
    }
    catch (error) {
        console.error('Ошибка при добавлении новости:', error);
        alert('Не удалось добавить новость');
    }
}
function openEditModal(postId) {
    const post = feedPosts.find(p => p.id === postId);
    if (!post)
        return;
    postIdToEdit = postId;
    document.getElementById('editPostId').value = postId.toString();
    document.getElementById('editPostContent').value = post.content;
    document.getElementById('editPostImage').value = post.image || '';
    editPostModal?.show();
}
async function handleEditPost() {
    if (!postIdToEdit)
        return;
    const content = document.getElementById('editPostContent').value.trim();
    const image = document.getElementById('editPostImage').value.trim();
    if (!content) {
        alert('Пожалуйста, введите содержание новости');
        return;
    }
    try {
        // Здесь нужно добавить API endpoint для редактирования
        const response = await fetch(`/posts/api/posts/${postIdToEdit}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content,
                image: image || undefined
            })
        });
        if (!response.ok)
            throw new Error('Ошибка при редактировании новости');
        editPostModal?.hide();
        postIdToEdit = null;
        await loadFeed();
    }
    catch (error) {
        console.error('Ошибка при редактировании новости:', error);
        alert('Не удалось отредактировать новость');
    }
}
async function handleDeletePost(postId) {
    try {
        const response = await fetch(`/posts/api/posts/${postId}`, {
            method: 'DELETE'
        });
        if (!response.ok)
            throw new Error('Ошибка при удалении новости');
        await loadFeed();
    }
    catch (error) {
        console.error('Ошибка при удалении новости:', error);
        alert('Не удалось удалить новость');
    }
}
function updateStats() {
    const postsCountEl = document.getElementById('postsCount');
    if (postsCountEl) {
        postsCountEl.textContent = feedPosts.length.toString();
    }
    // Получаем количество уникальных авторов (друзей)
    const uniqueAuthors = new Set(feedPosts.map(p => p.authorId));
    const friendsCountEl = document.getElementById('friendsCount');
    if (friendsCountEl) {
        friendsCountEl.textContent = (uniqueAuthors.size - 1).toString(); // -1 чтобы не считать самого пользователя
    }
}
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1)
        return 'только что';
    if (diffMins < 60)
        return `${diffMins} мин. назад`;
    if (diffHours < 24)
        return `${diffHours} ч. назад`;
    if (diffDays < 7)
        return `${diffDays} дн. назад`;
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

import '../public/scss/style.scss';
import {Modal} from 'bootstrap';
import type {Post} from '../models/Post';

interface PostWithAuthor extends Post {
    authorName: string;
}

let allPosts: PostWithAuthor[] = [];
let viewPostModal: Modal;
let createPostModal: Modal;
let deleteConfirmModal: Modal;
let currentPostId: number | null = null;
const currentFilters: { [key: string]: string } = {
    status: ''
};

document.addEventListener('DOMContentLoaded', async () => {
    viewPostModal = new Modal(document.getElementById('viewPostModal')!);
    createPostModal = new Modal(document.getElementById('createPostModal')!);
    deleteConfirmModal = new Modal(document.getElementById('deleteConfirmModal')!);

    await loadPosts();
    setupEventListeners();
});

async function loadPosts(): Promise<void> {
    try {
        const response = await fetch('/posts/api/posts');
        allPosts = await response.json();
        renderPosts();
    } catch (error) {
        console.error('Ошибка загрузки публикаций:', error);
    }
}

function renderPosts(): void {
    const tbody = document.getElementById('postsTableBody');
    if (!tbody) return;

    const filteredPosts = allPosts.filter(post => {
        return currentFilters.status ? post.status === currentFilters.status : true;
    });

    tbody.innerHTML = filteredPosts.map(post => `
        <tr>
            <td>${post.id}</td>
            <td>${post.authorName}</td>
            <td>${post.content.substring(0, 50)}...</td>
            <td>${new Date(post.createdAt).toLocaleDateString('ru-RU')}</td>
            <td><span class="badge bg-${post.status === 'active' ? 'success' : 'danger'}">${post.status === 'active' ? 'Активен' : 'Заблокирован'}</span></td>
            <td>
                <button class="btn btn-sm btn-info view-post" data-id="${post.id}" title="Просмотр">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-post" data-id="${post.id}" title="Удалить">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    setupTableEventListeners();
}

function setupTableEventListeners(): void {
    document.querySelectorAll('.view-post').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = (e.currentTarget as HTMLElement).dataset.id;
            if (id) openViewModal(parseInt(id, 10));
        });
    });

    document.querySelectorAll('.delete-post').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = (e.currentTarget as HTMLElement).dataset.id;
            if (id) {
                currentPostId = parseInt(id, 10);
                deleteConfirmModal.show();
            }
        });
    });
}

function setupEventListeners(): void {
    document.getElementById('activatePostBtn')?.addEventListener('click', () => updatePostStatus('active'));
    document.getElementById('blockPostBtn')?.addEventListener('click', () => updatePostStatus('blocked'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => deletePost());

    document.getElementById('createPostForm')?.addEventListener('submit', handleCreatePost);

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
                renderPosts();
            }
        });
    });
}

async function handleCreatePost(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const authorId = (document.getElementById('postAuthor') as HTMLSelectElement).value;
    const content = (document.getElementById('postContent') as HTMLTextAreaElement).value;

    if (!authorId || !content) {
        alert('Пожалуйста, заполните все поля.');
        return;
    }

    try {
        const response = await fetch('/posts/api/posts', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({authorId, content})
        });

        if (response.ok) {
            createPostModal.hide();
            form.reset();
            await loadPosts();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Не удалось создать публикацию');
        }
    } catch (error: any) {
        console.error('Ошибка создания публикации:', error);
        alert(`Ошибка: ${error.message}`);
    }
}

async function openViewModal(id: number): Promise<void> {
    try {
        const response = await fetch(`/posts/api/posts/${id}`);
        if (!response.ok) throw new Error('Публикация не найдена');
        const post: PostWithAuthor = await response.json();

        currentPostId = post.id;
        (document.getElementById('viewPostAuthor') as HTMLElement).textContent = post.authorName;
        (document.getElementById('viewPostDate') as HTMLElement).textContent = new Date(post.createdAt).toLocaleString('ru-RU');
        (document.getElementById('viewPostContent') as HTMLElement).textContent = post.content;
        const statusBadge = document.getElementById('viewPostStatus') as HTMLElement;
        statusBadge.textContent = post.status === 'active' ? 'Активен' : 'Заблокирован';
        statusBadge.className = `badge ms-2 bg-${post.status === 'active' ? 'success' : 'danger'}`;

        const activateBtn = document.getElementById('activatePostBtn') as HTMLButtonElement;
        const blockBtn = document.getElementById('blockPostBtn') as HTMLButtonElement;
        activateBtn.style.display = post.status === 'blocked' ? 'inline-block' : 'none';
        blockBtn.style.display = post.status === 'active' ? 'inline-block' : 'none';

        viewPostModal.show();
    } catch (error) {
        console.error('Ошибка загрузки публикации:', error);
        alert('Не удалось загрузить данные публикации.');
    }
}

async function updatePostStatus(status: 'active' | 'blocked'): Promise<void> {
    if (!currentPostId) return;

    try {
        const response = await fetch(`/posts/api/posts/${currentPostId}/status`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({status})
        });

        if (response.ok) {
            viewPostModal.hide();
            await loadPosts();
        } else {
            throw new Error('Не удалось обновить статус');
        }
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
        alert('Не удалось обновить статус публикации.');
    }
}

async function deletePost(): Promise<void> {
    if (!currentPostId) return;

    try {
        const response = await fetch(`/posts/api/posts/${currentPostId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            deleteConfirmModal.hide();
            await loadPosts();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Не удалось удалить публикацию');
        }
    } catch (error: any) {
        console.error('Ошибка удаления публикации:', error);
        alert(`Ошибка: ${error.message}`);
    }
}

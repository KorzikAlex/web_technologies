import '../public/scss/style.scss';
import {Modal} from 'bootstrap';
import type {Post} from '../models/Post';

interface PostWithAuthor extends Post {
    authorName: string;
}

let allPosts: PostWithAuthor[] = [];
let viewPostModal: Modal;
let currentPostId: number | null = null;

document.addEventListener('DOMContentLoaded', async () => {
    viewPostModal = new Modal(document.getElementById('viewPostModal')!);
    await loadPosts();
    setupEventListeners();
});

async function loadPosts(): Promise<void> {
    try {
        const response = await fetch('/posts/api/posts');
        allPosts = await response.json();
        renderPosts(allPosts);
    } catch (error) {
        console.error('Ошибка загрузки публикаций:', error);
    }
}

function renderPosts(posts: PostWithAuthor[]): void {
    const tbody = document.getElementById('postsTableBody');
    if (!tbody) return;

    tbody.innerHTML = posts.map(post => `
        <tr>
            <td>${post.id}</td>
            <td>${post.authorName}</td>
            <td>${post.content.substring(0, 50)}...</td>
            <td>${new Date(post.createdAt).toLocaleDateString('ru-RU')}</td>
            <td><span class="badge bg-${post.status === 'active' ? 'success' : 'danger'}">${post.status === 'active' ? 'Активен' : 'Заблокирован'}</span></td>
            <td>
                <button class="btn btn-sm btn-info view-post" data-id="${post.id}">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');

    setupTableEventListeners();
}

function setupTableEventListeners(): void {
    document.querySelectorAll('.view-post').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = (e.currentTarget as HTMLElement).dataset.id;
            if (id) {
                await openViewModal(parseInt(id, 10));
            }
        });
    });
}

function setupEventListeners(): void {
    document.getElementById('activatePostBtn')?.addEventListener('click', () => updatePostStatus('active'));
    document.getElementById('blockPostBtn')?.addEventListener('click', () => updatePostStatus('blocked'));

    (window as any).filterPosts = (status: 'all' | 'active' | 'blocked') => {
        if (status === 'all') {
            renderPosts(allPosts);
        } else {
            const filtered = allPosts.filter(p => p.status === status);
            renderPosts(filtered);
        }
    };
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

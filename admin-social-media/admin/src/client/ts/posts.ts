import { Modal } from 'bootstrap';

type Post = {
    id: number;
    authorId: string;
    content: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    imagePath?: string;
    status: string;
};

type User = {
    id: number;
    name: string;
    surname: string;
    avatarPath?: string;
};

async function fetchUsersByIds(ids: number[]): Promise<User[]> {
    const param = ids.join(',');
    const resp = await fetch(`https://localhost:3000/users?ids=${encodeURIComponent(param)}`);
    if (!resp.ok) throw new Error('Failed to fetch users');
    return await resp.json();
}

async function fetchPostsForAuthors(authorIds: number[]): Promise<Post[]> {
    const param = authorIds.join(',');
    const resp = await fetch(`https://localhost:3000/posts?authorIds=${encodeURIComponent(param)}`);
    if (!resp.ok) throw new Error('Failed to fetch posts');
    return await resp.json();
}

function renderPosts(posts: Post[], users: Record<string, User>, container: HTMLElement, currentUserId: number) {
    if (posts.length === 0) {
        container.innerHTML = '<p class="text-muted">Нет новостей.</p>';
        return;
    }
    container.innerHTML = '';
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    posts.forEach(p => {
        const user = users[p.authorId];
        const avatarHtml = user?.avatarPath ? `<img src="${user.avatarPath}" alt="Avatar" class="rounded-circle me-2" style="width: 40px; height: 40px;">` : `<i class="bi bi-person-circle text-muted me-2" style="font-size: 40px;"></i>`;
        const fullName = user ? `${user.name} ${user.surname}` : 'Неизвестный пользователь';
        const isOwnPost = Number(p.authorId) === currentUserId;
        const el = document.createElement('div');
        el.className = 'card mb-3';
        el.innerHTML = `
          <div class="card-body">
            <div class="d-flex align-items-center mb-2 justify-content-between">
              <div class="d-flex align-items-center">
                ${avatarHtml}
                <div>
                  <h6 class="card-title mb-0">${escapeHtml(fullName)}</h6>
                  <small class="text-muted">${new Date(p.createdAt).toLocaleString()}</small>
                </div>
              </div>
              ${isOwnPost ? `<button class="btn btn-sm btn-danger delete-post-btn" data-post-id="${p.id}"><i class="bi bi-trash"></i> Удалить</button>` : ''}
            </div>
            <p class="card-text">${escapeHtml(p.content)}</p>
            ${p.imagePath ? `<img src="${escapeAttr(p.imagePath)}" class="card-img-bottom" alt="Post image" />` : ''}
          </div>
        `;
        container.appendChild(el);
    });
}

function escapeHtml(s: string) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escapeAttr(s: string) {
    return String(s).replace(/"/g, '&quot;');
}

export function openPostsPage(userId: number, friendIds: number[]) {
    const friendIdsParam = friendIds.join(',');
    window.location.href = `/posts-page/${userId}?friendIds=${encodeURIComponent(friendIdsParam)}`;
}

// Логика для страницы новостей
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = parseInt(window.location.pathname.split('/').pop() || '0');
    const friendIdsParam = urlParams.get('friendIds') || '';
    const friendIds = friendIdsParam ? friendIdsParam.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];

    if (!userId) return;

    const authorIds = [userId, ...friendIds];
    const postsList = document.getElementById('postsList') as HTMLElement;

    try {
        const posts = await fetchPostsForAuthors(authorIds);
        const uniqueAuthorIds: number[] = [...new Set(posts.map(p => Number(p.authorId)))];
        const users = await fetchUsersByIds(uniqueAuthorIds);
        const usersMap: Record<string, User> = users.reduce((map, u) => { map[u.id.toString()] = u; return map; }, {} as Record<string, User>);
        renderPosts(posts, usersMap, postsList, userId);
    } catch (err) {
        console.error(err);
        postsList.innerHTML = '<p class="text-danger">Не удалось загрузить новости.</p>';
    }

    // Handle create form
    const form = document.getElementById('createPostForm') as HTMLFormElement;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const content = (document.getElementById('postContent') as HTMLTextAreaElement).value.trim();
        const imagePath = (document.getElementById('postImage') as HTMLInputElement).value.trim() || undefined;
        if (!content) return;
        try {
            const resp = await fetch('https://localhost:3000/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, imagePath, authorId: userId }),
            });
            if (!resp.ok) throw new Error('create failed');
            // on success reload posts
            const updated = await fetchPostsForAuthors(authorIds);
            const uniqueAuthorIds: number[] = [...new Set(updated.map(p => Number(p.authorId)))];
            const users = await fetchUsersByIds(uniqueAuthorIds);
            const usersMap: Record<string, User> = users.reduce((map, u) => { map[u.id.toString()] = u; return map; }, {} as Record<string, User>);
            renderPosts(updated, usersMap, postsList, userId);
            form.reset();
        } catch (err) {
            console.error(err);
            alert('Не удалось создать новость');
        }
    };

    // Handle delete post
    postsList.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        const btn = target.closest('.delete-post-btn') as HTMLElement;
        if (!btn) return;

        const postId = btn.getAttribute('data-post-id');
        if (!postId) return;

        const deleteModalElement = document.getElementById('deletePostConfirmModal');
        if (deleteModalElement) {
            const deleteModal = new Modal(deleteModalElement);
            deleteModal.show();

            const confirmBtn = document.getElementById('confirmDeletePostBtn');
            const handler = async () => {
                try {
                    const resp = await fetch(`https://localhost:3000/posts/${postId}`, {
                        method: 'DELETE',
                    });
                    if (!resp.ok) throw new Error('delete failed');

                    // reload posts
                    const updated = await fetchPostsForAuthors(authorIds);
                    const uniqueAuthorIds: number[] = [...new Set(updated.map(p => Number(p.authorId)))];
                    const users = await fetchUsersByIds(uniqueAuthorIds);
                    const usersMap: Record<string, User> = users.reduce((map, u) => { map[u.id.toString()] = u; return map; }, {} as Record<string, User>);
                    renderPosts(updated, usersMap, postsList, userId);

                    deleteModal.hide();
                } catch (err) {
                    console.error(err);
                    alert('Не удалось удалить новость');
                }
                confirmBtn?.removeEventListener('click', handler);
            };
            confirmBtn?.addEventListener('click', handler);
        }
    });
});

export default { openPostsPage };

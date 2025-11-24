// posts-page.ts: логика для страницы posts.pug

type Post = {
    id: number;
    authorId: string;
    content: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    imagePath?: string;
    status: string;
};

async function fetchPostsForAuthors(authorIds: number[]): Promise<Post[]> {
    const param = authorIds.join(',');
    const resp = await fetch(`/posts?authorIds=${encodeURIComponent(param)}`);
    if (!resp.ok) throw new Error('Failed to fetch posts');
    return await resp.json();
}

function renderPosts(posts: Post[], container: HTMLElement) {
    if (posts.length === 0) {
        container.innerHTML = '<p class="text-muted">Нет новостей.</p>';
        return;
    }
    const list = document.createElement('div');
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    posts.forEach(p => {
        const el = document.createElement('div');
        el.className = 'card mb-2';
        el.innerHTML = `
          <div class="card-body">
            <p class="card-text">${escapeHtml(p.content)}</p>
            ${p.imagePath ? `<img src="${escapeAttr(p.imagePath)}" class="img-fluid rounded" alt="post image" />` : ''}
            <p class="text-muted small mt-2">Создано: ${new Date(p.createdAt).toLocaleString()}</p>
          </div>
        `;
        list.appendChild(el);
    });
    container.innerHTML = '';
    container.appendChild(list);
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

// Получить userId и friendIds (например, из глобального объекта или запроса)
function getUserAndFriends(): { userId: number, friendIds: number[] } {
    // TODO: заменить на реальную логику получения id пользователя и друзей
    return { userId: 1, friendIds: [2] };
}

document.addEventListener('DOMContentLoaded', async () => {
    const { userId, friendIds } = getUserAndFriends();
    const postsList = document.getElementById('postsList')!;
    try {
        const posts = await fetchPostsForAuthors([userId, ...friendIds]);
        renderPosts(posts, postsList);
    } catch {
        postsList.innerHTML = '<p class="text-danger">Не удалось загрузить новости.</p>';
    }

    const form = document.getElementById('createPostForm') as HTMLFormElement;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const content = (document.getElementById('postContent') as HTMLTextAreaElement).value.trim();
        const imagePath = (document.getElementById('postImage') as HTMLInputElement).value.trim() || undefined;
        if (!content) return;
        try {
            const resp = await fetch('/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, imagePath, authorId: userId }),
            });
            if (!resp.ok) throw new Error('create failed');
            // on success reload posts
            await resp.json();
            const updated = await fetchPostsForAuthors([userId, ...friendIds]);
            renderPosts(updated, postsList);
            form.reset();
        } catch {
            alert('Не удалось создать новость');
        }
    };
});

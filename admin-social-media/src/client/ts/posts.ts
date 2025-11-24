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

function createModalHtml(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
    <div class="modal fade custom-modal" id="userPostsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Новости</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div id="postsList" class="mb-3"></div>

            <hr />
            <h6>Создать новость</h6>
            <form id="createPostForm">
              <div class="mb-2">
                <textarea class="form-control" id="postContent" rows="3" placeholder="Текст новости" required></textarea>
              </div>
              <div class="mb-2">
                <input class="form-control" id="postImage" placeholder="Ссылка на изображение (опционально)" />
              </div>
              <div class="text-end">
                <button type="submit" class="btn btn-primary">Опубликовать</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    `;
    return wrapper.firstElementChild as HTMLElement;
}

async function fetchPostsForAuthors(authorIds: number[]): Promise<Post[]> {
    const param = authorIds.join(',');
    const resp = await fetch(`https://localhost:3000/posts?authorIds=${encodeURIComponent(param)}`);
    if (!resp.ok) throw new Error('Failed to fetch posts');
    return await resp.json();
}

function renderPosts(posts: Post[], container: HTMLElement) {
    if (posts.length === 0) {
        container.innerHTML = '<p class="text-muted">Нет новостей.</p>';
        return;
    }
    const list = document.createElement('div');
    list.className = 'posts-list';
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    posts.forEach(p => {
        const el = document.createElement('div');
        el.className = 'post-item';
        el.innerHTML = `
          <div class="card-body">
            <p class="post-content">${escapeHtml(p.content)}</p>
            ${p.imagePath ? `<img src="${escapeAttr(p.imagePath)}" class="img-fluid rounded" alt="post image" />` : ''}
            <p class="post-meta">Создано: ${new Date(p.createdAt).toLocaleString()}</p>
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

export async function openPostsModal(userId: number, friendIds: number[]) {
    // Ensure modal exists
    let modalEl = document.getElementById('userPostsModal');
    if (!modalEl) {
        const created = createModalHtml();
        document.body.appendChild(created);
        modalEl = document.getElementById('userPostsModal')!;
    }

    const modal = new Modal(modalEl);
    const postsList = modalEl.querySelector('#postsList') as HTMLElement;

    const authorIds = [userId, ...friendIds];
    try {
        const posts = await fetchPostsForAuthors(authorIds);
        renderPosts(posts, postsList);
    } catch (err) {
        postsList.innerHTML = '<p class="text-danger">Не удалось загрузить новости.</p>';
    }

    // Handle create form
    const form = modalEl.querySelector('#createPostForm') as HTMLFormElement;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const content = (modalEl!.querySelector('#postContent') as HTMLTextAreaElement).value.trim();
        const imagePath = (modalEl!.querySelector('#postImage') as HTMLInputElement).value.trim() || undefined;
        if (!content) return;
        try {
          const resp = await fetch('https://localhost:3000/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, imagePath, authorId: userId }),
          });
          if (!resp.ok) throw new Error('create failed');
          // on success reload posts
          const newPost = await resp.json();
          const updated = await fetchPostsForAuthors(authorIds);
          renderPosts(updated, postsList);
          form.reset();
        } catch (err) {
          alert('Не удалось создать новость');
        }
    };

    modal.show();
}

export default { openPostsModal };

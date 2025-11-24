/**
 * @file Post.ts
 * @fileoverview Модель данных для поста в социальной сети
 * @module Post
 */
export type PostStatus = 'active' | 'blocked'; // Статусы поста

/**
 * Модель данных для поста в социальной сети
 * @interface Post
 * @property {number} id - Уникальный идентификатор поста
 * @property {string} authorId - Идентификатор автора поста
 * @property {string} content - Содержимое поста
 * @property {Date} createdAt - Дата и время создания поста
 * @property {Date} updatedAt - Дата и время последнего обновления поста
 * @property {string} [imagePath] - Путь к изображению, прикрепленному к посту (необязательно)
 * @property {PostStatus} status - Статус поста (активен или заблокирован)
 * @property {string} title - Заголовок/название поста
 */
export interface Post {
    id: number,
    authorId: string,
    content: string,
    createdAt: Date,
    updatedAt: Date,
    imagePath?: string | undefined,
    status: PostStatus
}
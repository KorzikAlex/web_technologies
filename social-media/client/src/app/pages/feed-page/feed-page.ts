import { Component, inject, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { PostCard } from "../../shared/card/post-card/post-card";
import { ProfileService } from '../../data/services/profile.service';
import { FeedService } from '../../data/services/feed.service';
import { User } from '../../data/interfaces/profile.interface';
import { FeedInterface } from '../../data/interfaces/feed.interface';
import { CreatePostCard, NewPost } from '../../shared/card/create-post-card/create-post-card';
import { forkJoin, Subscription } from 'rxjs';

@Component({
    selector: 'app-feed-page',
    imports: [PostCard, CreatePostCard],
    templateUrl: './feed-page.html',
    styleUrl: './feed-page.scss',
})
export class FeedPage implements OnDestroy {
    protected profileService = inject(ProfileService);
    protected feedService = inject(FeedService);
    private cdr = inject(ChangeDetectorRef);

    @Input() feedArray: Record<string, string>[] = [];

    protected userProfile: User | null = null;
    protected posts: FeedInterface[] = [];
    protected usersMap: Map<number, User> = new Map();
    private sseSubscription?: Subscription;
    private allowedAuthorIds: Set<number> = new Set();

    constructor() {
        this.loadUserDataAndPosts();
    }

    ngOnDestroy(): void {
        // Отписываемся от SSE при уничтожении компонента
        if (this.sseSubscription) {
            this.sseSubscription.unsubscribe();
        }
    }

    private loadUserDataAndPosts(): void {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;

        const currentUser = JSON.parse(userStr);
        const userId = currentUser.id;

        // Загружаем профиль пользователя и его друзей
        forkJoin({
            profile: this.profileService.getUserProfile(userId.toString()),
            friends: this.profileService.getUserFriends(userId.toString())
        }).subscribe(({ profile, friends }) => {
            this.userProfile = profile;

            // Сохраняем информацию о пользователе
            this.usersMap.set(profile.id, profile);

            // Сохраняем информацию о друзьях
            if (Array.isArray(friends)) {
                friends.forEach((friend: User) => {
                    this.usersMap.set(friend.id, friend);
                });
            }

            // Загружаем посты
            const friendIds = Array.isArray(friends) ? friends.map((f: User) => f.id) : [];
            this.loadPosts(profile.id, friendIds);

            // Сохраняем список разрешенных авторов (пользователь + друзья)
            this.allowedAuthorIds.add(profile.id);
            friendIds.forEach(id => this.allowedAuthorIds.add(id));

            // Подписываемся на обновления в реальном времени
            this.subscribeToRealTimeUpdates();
        });
    }

    private loadPosts(userId: number, friendIds: number[]): void {
        this.feedService.getPostsByUserAndFriends(userId, friendIds).subscribe(
            (posts) => {
                this.posts = posts.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                // Явно запускаем детекцию изменений для немедленного отображения постов
                this.cdr.detectChanges();
            }
        );
    }

    onPostCreated(newPost: NewPost): void {
        if (!this.userProfile) return;

        const postData = {
            content: newPost.text,
            authorId: this.userProfile.id,
            imagePath: newPost.imageUrl || undefined
        };

        this.feedService.createPost(postData).subscribe(
            (createdPost) => {
                // Пост будет добавлен автоматически через SSE, не добавляем здесь
                // чтобы избежать дублирования
            },
            (error) => {
                console.error('Ошибка при создании поста:', error);
            }
        );
    }

    getAuthorName(authorId: string): string {
        const user = this.usersMap.get(Number(authorId));
        return user ? `${user.name} ${user.surname}` : 'Неизвестный автор';
    }

    getAuthorAvatar(authorId: string): string {
        const user = this.usersMap.get(Number(authorId));
        // Возвращаем аватар или заглушку
        return user?.avatarPath || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.getAuthorName(authorId)) + '&background=random';
    }

    isOwnPost(authorId: string): boolean {
        return this.userProfile ? Number(authorId) === this.userProfile.id : false;
    }

    private subscribeToRealTimeUpdates(): void {
        // Подписываемся на новые посты через SSE
        this.sseSubscription = this.feedService.subscribeToPostUpdates().subscribe(
            (newPost) => {
                // Проверяем, что пост от пользователя или его друзей
                const authorId = Number(newPost.authorId);
                if (this.allowedAuthorIds.has(authorId)) {
                    // Проверяем, что пост еще не существует в списке
                    const exists = this.posts.some(p => p.id === newPost.id);
                    if (!exists) {
                        // Добавляем новый пост в начало списка
                        this.posts.unshift(newPost);
                        // Явно запускаем детекцию изменений для обновления UI
                        this.cdr.detectChanges();
                    }
                }
            },
            (error) => {
                console.error('Ошибка при подписке на обновления:', error);
            }
        );
    }
}

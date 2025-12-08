import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from 'rxjs';
import {FeedInterface} from '../interfaces/feed.interface';

@Injectable({
    providedIn: 'root',
})
export class FeedService {
    http: HttpClient = inject(HttpClient);

    baseApiUrl: string = 'https://localhost:3000/';

    getAllFeeds(){
        return this.http.get(`${this.baseApiUrl}api/feeds`);
    }

    // Получить посты пользователя и его друзей
    getPostsByUserAndFriends(userId: number, friendIds: number[]): Observable<FeedInterface[]> {
        const allIds = [userId, ...friendIds];
        const idsParam = allIds.join(',');
        return this.http.get<FeedInterface[]>(`${this.baseApiUrl}posts?authorIds=${idsParam}`);
    }

    // Создать новый пост
    createPost(post: {content: string, authorId: number, imagePath?: string}): Observable<FeedInterface> {
        return this.http.post<FeedInterface>(`${this.baseApiUrl}posts`, post);
    }

    // Подключиться к потоку обновлений постов через SSE
    subscribeToPostUpdates(): Observable<FeedInterface> {
        return new Observable(observer => {
            const eventSource = new EventSource(`${this.baseApiUrl}posts/stream`);

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // Пропускаем служебные сообщения
                    if (data.type !== 'connected') {
                        observer.next(data as FeedInterface);
                    }
                } catch (error) {
                    console.error('Ошибка парсинга SSE данных:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('SSE ошибка:', error);
                eventSource.close();
                observer.error(error);
            };

            // Очистка при отписке
            return () => {
                eventSource.close();
            };
        });
    }
}

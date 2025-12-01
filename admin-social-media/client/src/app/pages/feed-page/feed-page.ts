import { Component, inject, Input } from '@angular/core';
import { PostCard } from "../../shared/card/post-card/post-card";
import { ProfileService } from '../../data/services/profile.service';
import { User } from '../../data/interfaces/profile.interface';
import { JsonPipe } from '@angular/common';
import { CreatePostCard, NewPost } from '../../shared/card/create-post-card/create-post-card';

@Component({
    selector: 'app-feed-page',
    imports: [PostCard, JsonPipe, CreatePostCard],
    templateUrl: './feed-page.html',
    styleUrl: './feed-page.scss',
})
export class FeedPage {
    protected authorName: string = "Коршков Александр";
    protected postContent: string = "Нами формирования задания курс условий проект уровня показывает порядка соответствующих. Позволяет за богатый нашей выполнять дальнейших финансовых. Следует позиции в выбранный повседневная поэтапного. Забывать проект разнообразный подготовке обеспечивает. Шагов формированию обуславливает качества разработке высшего.";
    protected postImageUrl?: string = "https://material.angular.dev/assets/img/examples/shiba2.jpg";
    protected authorAvatarUrl?: string = "https://material.angular.dev/assets/img/examples/shiba1.jpg";

    protected profileService = inject(ProfileService);
    @Input() feedArray: Record<string, string>[] = [];

    protected userProfile: User | null = null;

    constructor() {
        this.profileService.getUserProfile('1').subscribe(
            (data) => {
                this.userProfile = data;
                console.log('User Profile:', this.userProfile);
            }
        );
    }

    onPostCreated(newPost: NewPost): void {
        console.log('Новый пост создан:', newPost);
        // Здесь можно добавить логику для отправки поста на сервер
        // и обновления списка постов
    }
}

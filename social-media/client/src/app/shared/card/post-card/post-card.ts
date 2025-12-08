import { Component, Input } from '@angular/core';
import { MatCardTitle } from "@angular/material/card";
import { BaseCard } from "../base-card/base-card";
import { DatePipe } from "@angular/common";

@Component({
    selector: 'app-post-card',
    imports: [BaseCard, MatCardTitle, DatePipe],
    templateUrl: './post-card.html',
    styleUrl: './post-card.scss',
})
export class PostCard {
    @Input() authorAvatarUrl: string = 'https://ui-avatars.com/api/?name=User&background=random'; // Заглушка по умолчанию
    @Input() authorName: string = "";
    @Input() postImageUrl?: string;
    @Input() postContent: string = "";
    @Input() createdAt: string = "";
    @Input() isOwnPost: boolean = false; // Флаг для обозначения своего поста

}

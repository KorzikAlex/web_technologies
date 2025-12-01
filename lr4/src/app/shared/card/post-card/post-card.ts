import { Component, Input } from '@angular/core';
import { MatCardTitle } from "@angular/material/card";
import { BaseCard } from "../base-card/base-card";

@Component({
    selector: 'app-post-card',
    imports: [BaseCard, MatCardTitle],
    templateUrl: './post-card.html',
    styleUrl: './post-card.scss',
})
export class PostCard {
    @Input() authorAvatarUrl?: string;
    @Input() authorName: string = "";
    @Input() postImageUrl?: string;
    @Input() postContent: string = "";

}

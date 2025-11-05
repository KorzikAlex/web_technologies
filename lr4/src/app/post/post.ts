import {Component} from '@angular/core';
import {
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardImage,
    MatCardSubtitle,
    MatCardTitle
} from "@angular/material/card";
import {DatePipe} from "@angular/common";

@Component({
    selector: 'app-post',
    imports: [
        MatCard,
        MatCardTitle,
        MatCardHeader,
        MatCardSubtitle,
        MatCardContent,
        DatePipe,
        MatCardImage
    ],
    templateUrl: './post.html',
    styleUrl: './post.scss',
})
export class Post {
    post = {
        title: 'Sample Post Title',
        author: 'John Doe',
        date: '2024-06-01',
        content: 'This is a sample post content.'
    };
}

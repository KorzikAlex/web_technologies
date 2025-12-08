import { Component } from '@angular/core';
import {
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardFooter,
    MatCardHeader,
} from "@angular/material/card";

@Component({
    selector: 'app-base-card',
    imports: [
        MatCard,
        MatCardHeader,
        MatCardContent,
        MatCardActions,
        MatCardFooter,
    ],
    templateUrl: './base-card.html',
    styleUrl: './base-card.scss',
})
export class BaseCard {
}

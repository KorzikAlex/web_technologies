/**
 * @file auth-card.ts
 * @description
 * В этом файле определяется компонент AuthCard, который представляет собой карточку
 * для аутентификации пользователей.
 * @module AuthCard
 */
import {Component} from '@angular/core';
import {
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardFooter,
    MatCardHeader,
} from "@angular/material/card";

/**
 * Компонент AuthCard представляет собой карточку для аутентификации пользователей.
 */
@Component({
    selector: 'app-auth-card',
    imports: [
        MatCard,
        MatCardHeader,
        MatCardContent,
        MatCardActions,
        MatCardFooter,
    ],
    templateUrl: './auth-card.html',
    styleUrl: './auth-card.scss',
})
export class AuthCard {
}

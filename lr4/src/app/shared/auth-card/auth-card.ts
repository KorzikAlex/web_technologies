import {Component, input, InputSignal} from '@angular/core';
import {
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardFooter,
    MatCardHeader, MatCardSubtitle,
    MatCardTitle, MatCardTitleGroup
} from "@angular/material/card";

@Component({
    selector: 'app-auth-card',
    imports: [
        MatCard,
        MatCardHeader,
        MatCardTitle,
        MatCardContent,
        MatCardActions,
        MatCardFooter,
        MatCardSubtitle,
        MatCardTitleGroup
    ],
    templateUrl: './auth-card.html',
    styleUrl: './auth-card.scss',
})
export class AuthCard {
    readonly title: InputSignal<string | undefined> = input<string>();
    readonly subtitle: InputSignal<string | undefined> = input<string>();
}

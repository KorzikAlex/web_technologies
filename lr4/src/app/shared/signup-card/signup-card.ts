import {Component} from '@angular/core';
import {AuthCard} from "../auth-card/auth-card";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-signup-card',
    imports: [AuthCard, MatFormField, MatInput, MatButton, RouterLink],
    templateUrl: './signup-card.html',
    styleUrl: './signup-card.scss',
})
export class SignupCard {
}

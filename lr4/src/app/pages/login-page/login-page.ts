import {Component, inject} from '@angular/core';
import {LoginCard} from "../../shared/card/login-card/login-card";
import {NgOptimizedImage} from "@angular/common";
import {AuthService} from "../../data/services/auth.service";

@Component({
    selector: 'app-login-page',
    imports: [LoginCard, NgOptimizedImage],
    templateUrl: './login-page.html',
    styleUrl: './login-page.scss',
})
export class LoginPage {
    authService: AuthService = inject(AuthService);
}

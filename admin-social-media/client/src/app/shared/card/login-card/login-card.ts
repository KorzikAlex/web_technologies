/**
 * @file login-card.ts
 * @description Компонент для входа пользователя в систему.
 * Содержит форму с полями для ввода имени пользователя и пароля,
 * а также кнопку для отправки формы.
 * @module LoginCard
 */
import { Component, inject } from '@angular/core';
import { BaseCard } from "../base-card/base-card";
import { MatButton } from "@angular/material/button";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { Router, RouterLink } from "@angular/router";
import { MatIconModule } from '@angular/material/icon';
import { MatCardTitle } from "@angular/material/card";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../data/services/auth.service";

/**
 * Элемент интерфейса для входа пользователя в систему.
 * Содержит форму с полями для ввода имени пользователя и пароля,
 * а также кнопку для отправки формы.
 */
@Component({
    selector: 'app-login-card',
    imports: [
        BaseCard,
        MatButton,
        MatFormField,
        MatInput,
        RouterLink,
        MatLabel,
        MatError,
        MatIconModule,
        MatCardTitle,
        ReactiveFormsModule,
    ],
    templateUrl: './login-card.html',
    styleUrl: './login-card.scss',
})
export class LoginCard {
    /**
     * Фабрика форм для создания реактивной формы входа.
     * @private
     */
    private fb: FormBuilder = new FormBuilder();
    private authService = inject(AuthService);
    private router = inject(Router);

    /**
     * Реактивная форма для входа пользователя.
     * @protected
     */
    protected loginForm: FormGroup = this.fb.group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });

    protected readonly formFields = [
        {
            label: 'Имя пользователя',
            controlName: 'username',
            type: 'text'
        },
        {
            label: 'Пароль',
            controlName: 'password',
            type: 'password'
        },
    ];

    protected errorMessage: string = '';

    /**
     * Обработчик события отправки формы входа.
     * @protected
     */
    protected onSubmit(): void {
        if (this.loginForm.valid) {
            this.errorMessage = '';
            this.authService.login(this.loginForm.value).subscribe({
                next: (response) => {
                    console.log('Успешная авторизация:', response);
                    this.router.navigate(['/feed']);
                },
                error: (error) => {
                    console.error('Ошибка авторизации:', error);
                    this.errorMessage = error.error?.message || 'Ошибка авторизации';
                }
            });
        }
    }
}

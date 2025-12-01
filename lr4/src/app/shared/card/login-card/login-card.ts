/**
 * @file login-card.ts
 * @description Компонент для входа пользователя в систему.
 * Содержит форму с полями для ввода имени пользователя и пароля,
 * а также кнопку для отправки формы.
 * @module LoginCard
 */
import { Component } from '@angular/core';
import { BaseCard } from "../base-card/base-card";
import { MatButton } from "@angular/material/button";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { RouterLink } from "@angular/router";
import { MatIconModule } from '@angular/material/icon';
import { MatCardTitle } from "@angular/material/card";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";

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

    /**
     * Обработчик события отправки формы входа.
     * @protected
     */
    protected onSubmit(): void {
        if (this.loginForm.valid) {
            console.log('Login form submitted:', this.loginForm.value);
        }
    }
}

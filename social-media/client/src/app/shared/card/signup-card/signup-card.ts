import { Component, inject } from '@angular/core';
import { BaseCard } from "../base-card/base-card";
import { MatFormField, MatLabel, MatError, MatSuffix } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatButton } from "@angular/material/button";
import { Router, RouterLink } from "@angular/router";
import {
    MatDatepicker,
    MatDatepickerToggle,
    MatDatepickerModule
} from "@angular/material/datepicker";
import { MatIconModule } from "@angular/material/icon";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from "@angular/forms";
import { MatCardTitle } from "@angular/material/card";
import { AuthService } from "../../../data/services/auth.service";

@Component({
    selector: 'app-signup-card',
    imports: [
        MatFormField,
        MatInput,
        MatButton,
        RouterLink,
        MatDatepicker,
        MatDatepickerToggle,
        MatIconModule,
        MatLabel,
        MatError,
        ReactiveFormsModule,
        MatCardTitle,
        MatSuffix,
        MatDatepickerModule,
        BaseCard
    ],
    templateUrl: './signup-card.html',
    styleUrl: './signup-card.scss',
})
export class SignupCard {
    private fb: FormBuilder = new FormBuilder();
    private authService = inject(AuthService);
    private router = inject(Router);

    protected signupForm: FormGroup = this.fb.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        name: ['', [Validators.required]],
        surname: ['', [Validators.required]],
        patronymic: [''],
        birthDate: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });

    protected readonly formFields = [
        { label: 'Имя пользователя', controlName: 'username', type: 'text' },
        { label: 'Email', controlName: 'email', type: 'email' },
        { label: 'Имя', controlName: 'name', type: 'text' },
        { label: 'Фамилия', controlName: 'surname', type: 'text' },
        { label: 'Отчество', controlName: 'patronymic', type: 'text' },
        { label: 'Пароль', controlName: 'password', type: 'password' },
        { label: 'Подтверждение пароля', controlName: 'confirmPassword', type: 'password' },
    ];

    protected readonly birthDateField = { label: 'Дата рождения', controlName: 'birthDate', type: 'date' };
    protected errorMessage: string = '';

    private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');

        if (!password || !confirmPassword) {
            return null;
        }

        return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    }

    protected onSubmit(): void {
        if (this.signupForm.valid) {
            this.errorMessage = '';
            const formValue = this.signupForm.value;

            // Форматируем дату для отправки на сервер
            const signupData = {
                username: formValue.username,
                email: formValue.email,
                password: formValue.password,
                name: formValue.name,
                surname: formValue.surname,
                patronymic: formValue.patronymic || '',
                birthday: new Date(formValue.birthDate).toISOString()
            };

            this.authService.signup(signupData).subscribe({
                next: (response) => {
                    console.log('Успешная регистрация:', response);
                    this.router.navigate(['/feed']);
                },
                error: (error) => {
                    console.error('Ошибка регистрации:', error);
                    this.errorMessage = error.error?.message || 'Ошибка регистрации';
                }
            });
        }
    }
}

import {Component} from '@angular/core';
import {AuthCard} from "../auth-card/auth-card";
import {MatFormField, MatLabel, MatError, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {RouterLink} from "@angular/router";
import {
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle
} from "@angular/material/datepicker";
import {MatIconModule} from "@angular/material/icon";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl} from "@angular/forms";
import {MatCardTitle} from "@angular/material/card";

@Component({
    selector: 'app-signup-card',
    imports: [
        AuthCard,
        MatFormField,
        MatInput,
        MatButton,
        RouterLink,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        MatIconModule,
        MatLabel,
        MatError,
        ReactiveFormsModule,
        MatCardTitle,
        MatSuffix
    ],
    templateUrl: './signup-card.html',
    styleUrl: './signup-card.scss',
})
export class SignupCard {
    private fb: FormBuilder = new FormBuilder();

    protected signupForm: FormGroup = this.fb.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        birthDate: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });

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
            console.log('Signup form submitted:', this.signupForm.value);
            // Здесь будет логика регистрации
        }
    }
}

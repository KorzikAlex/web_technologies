import {Component} from '@angular/core';
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatButton} from "@angular/material/button";

@Component({
    selector: 'app-signup',
    imports: [
        MatCard,
        MatCardHeader,
        MatFormField,
        MatInput,
        ReactiveFormsModule,
        MatCardTitle,
        MatLabel,
        MatCardActions,
        MatProgressSpinner,
        MatButton,
        MatCardContent
    ],
    templateUrl: './signup.html',
    styleUrl: './signup.scss',
})
export class Signup {
    protected signupForm: FormGroup = new FormGroup({});

    protected signup() {

    }

    protected goToLogin() {

    }

    protected isLoading() {
        return undefined;
    }
}

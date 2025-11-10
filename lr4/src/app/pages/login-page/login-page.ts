import {Component} from '@angular/core';
import {LoginCard} from "../../shared/card/login-card/login-card";
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-login-page',
    imports: [LoginCard, NgOptimizedImage],
    templateUrl: './login-page.html',
    styleUrl: './login-page.scss',
})
export class LoginPage {

}

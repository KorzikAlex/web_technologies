import {Routes} from '@angular/router';
import {Login} from "./login/login";
import {Signup} from "./signup/signup";

export const routes: Routes = [
    {
        path: '/login',
        title: 'Login page',
        component: Login
    },
    {
        path: '/signup',
        title: 'Signup page',
        component: Signup
    }
];

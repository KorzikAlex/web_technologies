import {Routes} from '@angular/router';
import {SignupPage} from "./pages/signup-page/signup-page";
import {LoginPage} from "./pages/login-page/login-page";
import {Layout} from "./shared/layout/layout";

export const routes: Routes = [
    {
        path: '', component: Layout, children: [
        ],
        canActivate: []
    },
    {
        path: 'signup',
        component: SignupPage
    },
    {
        path: 'login',
        component: LoginPage
    },
];

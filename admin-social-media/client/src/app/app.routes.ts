import { Routes } from '@angular/router';
import { SignupPage } from "./pages/signup-page/signup-page";
import { LoginPage } from "./pages/login-page/login-page";
import { Layout } from "./shared/layout/layout";
import { FriendsPage } from './pages/friends-page/friends-page';
import { FeedPage } from './pages/feed-page/feed-page';
import { accessGuard } from './data/guard/access.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'feed',
        pathMatch: 'full',
    },
    {
        path: '',
        component: Layout,
        children: [
            {
                path: 'feed',
                component: FeedPage,
            },
            {
                path: 'friends',
                component: FriendsPage,
            },
        ],
        canActivate: [
            accessGuard
        ],
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

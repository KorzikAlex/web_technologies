import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, tap} from 'rxjs';
import {Router} from '@angular/router';

interface AuthResponse {
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
        role: string;
        name: string;
        surname: string;
        patronymic: string;
        avatarPath: string;
    };
}

interface UserInfo {
    id: number;
    username: string;
    email: string;
    role: string;
    name: string;
    surname: string;
    patronymic: string;
    birthDate?: string;
    avatarPath: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    http: HttpClient = inject(HttpClient);
    router: Router = inject(Router);

    private baseApiUrl: string = 'https://localhost:3000/auth/';

    login(payload: {username: string, password: string}): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseApiUrl}login`, payload).pipe(
            tap(response => {
                // Сохраняем токен и информацию о пользователе
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            })
        );
    }

    signup(payload: {
        username: string,
        email: string,
        password: string,
        name: string,
        surname: string,
        patronymic?: string,
        birthday: string
    }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseApiUrl}signup`, payload).pipe(
            tap(response => {
                // Сохраняем токен и информацию о пользователе
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            })
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getCurrentUser(): UserInfo | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    isAdmin(): boolean {
        const user = this.getCurrentUser();
        return user?.role === 'admin';
    }
}

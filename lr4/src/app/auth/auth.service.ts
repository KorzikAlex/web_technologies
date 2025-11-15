import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    http: HttpClient = inject(HttpClient);

    private baseApiUrl: string = 'https://localhost:3000/users/';

    login(payload: {username: string, password: string}) {
        return this.http.post(`${(this.baseApiUrl)}`, payload);
    }
}

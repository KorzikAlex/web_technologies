import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import { User } from '../interfaces/profile.interface';

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    protected readonly http: HttpClient = inject(HttpClient);

    protected readonly baseApiUrl: string = 'https://localhost:3000/';

    getUserProfile(userId: string) {
        return this.http.get<User>(`${this.baseApiUrl}users/${userId}`);
    }

    getUserFriends(userId: string) {
        return this.http.get<User>(`${this.baseApiUrl}users/${userId}/friends`);
    }
}

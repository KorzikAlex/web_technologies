import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    http: HttpClient = inject(HttpClient);

    baseApiUrl: string = 'http://localhost:3000/';

    getUserProfile(userId: string){
        return this.http.get(`${this.baseApiUrl}api/profiles/${userId}`);
    }
}

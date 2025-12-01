import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root',
})
export class FeedService {
    http: HttpClient = inject(HttpClient);

    baseApiUrl: string = 'http://localhost:3000/';

    getAllFeeds(){
        return this.http.get(`${this.baseApiUrl}api/feeds`);
    }
}

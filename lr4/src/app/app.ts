import {Component, inject, signal, WritableSignal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AuthCard} from "./shared/auth-card/auth-card";
import {SignupCard} from "./shared/signup-card/signup-card";
import {FeedService} from "./data/services/feed.service";
import {HttpClient} from "@angular/common/http";

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, AuthCard, SignupCard],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App {
    protected readonly title: WritableSignal<string> = signal('lr4');
    feed: Object = [];

    feedService: FeedService = inject(FeedService)

    constructor() {
        this.feedService.getAllFeeds().subscribe(feeds => {
            this.feed = feeds;
        })
    }
}

import {Component, inject, signal, WritableSignal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AuthCard} from "./shared/card/auth-card/auth-card";
import {SignupCard} from "./shared/card/signup-card/signup-card";
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
}

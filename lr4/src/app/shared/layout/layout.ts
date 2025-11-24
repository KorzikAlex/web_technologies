import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from "@angular/router";
import { Sidenav } from "../sidenav/sidenav";
import { MatListModule } from "@angular/material/list";
import { Toolbar } from "../toolbar/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { AuthCard } from "../card/auth-card/auth-card";

@Component({
    selector: 'app-layout',
    imports: [
    RouterOutlet,
    Sidenav,
    MatListModule,
    Toolbar,
    MatIconModule,
    RouterLink,
    MatButtonModule,
    AuthCard
],
    templateUrl: './layout.html',
    styleUrl: './layout.scss',
})
export class Layout {
    readonly listOptions = [
        { name: 'Новости', icon: 'article', route: '/signup' },
        { name: 'Друзья', icon: 'people', route: '/login' },
        { name: 'Администрирование', icon: 'admin_panel_settings', route: '/settings' },
    ];

}

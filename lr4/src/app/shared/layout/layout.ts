import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from "@angular/router";
import { Sidenav } from "../sidenav/sidenav";
import { MatListModule } from "@angular/material/list";
import { Toolbar } from "../toolbar/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { ProfileCard } from "../card/profile-card/profile-card";

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
        ProfileCard
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

    protected userProfile = {
        username: "korshkov_aa",
        fullName: "Коршков Александр Александрович",
        birthDate: "2003-07-15",
        email: "dsf@dsfasdsa.daf",
        avatarUrl: "https://material.angular.dev/assets/img/examples/shiba1.jpg"
    };

}

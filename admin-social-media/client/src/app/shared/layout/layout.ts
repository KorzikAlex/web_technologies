import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from "@angular/router";
import { Sidenav } from "../sidenav/sidenav";
import { MatListModule } from "@angular/material/list";
import { Toolbar } from "../toolbar/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { ProfileCard } from "../card/profile-card/profile-card";
import { AuthService } from "../../data/services/auth.service";

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
export class Layout implements OnInit {
    private authService = inject(AuthService);

    listOptions: Array<{ name: string; icon: string; route: string }> = [];

    protected userProfile: any = null;

    ngOnInit() {
        // Получаем информацию о текущем пользователе
        const currentUser = this.authService.getCurrentUser();

        if (currentUser) {
            this.userProfile = currentUser;
        }

        // Формируем список опций меню в зависимости от роли
        this.listOptions = [
            { name: 'Новости', icon: 'article', route: 'feed' },
        ];

        // Добавляем пункт администрирования только для администраторов
        if (this.authService.isAdmin()) {
            this.listOptions.push({
                name: 'Администрирование',
                icon: 'admin_panel_settings',
                route: 'admin'
            });
        }
    }

    logout(): void {
        this.authService.logout();
    }

}

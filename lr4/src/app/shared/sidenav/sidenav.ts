import { Component, Input, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from "@angular/material/sidenav";
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-sidenav',
    imports: [
        MatSidenavContent,
        MatSidenavContainer,
        MatSidenav,
        MatButtonModule,
    ],
    templateUrl: './sidenav.html',
    exportAs: 'appSidenav',
    styleUrl: './sidenav.scss',
})
export class Sidenav {
    @ViewChild(MatSidenav)
    sidenav!: MatSidenav;

    toggle(): void {
        this.sidenav.toggle();
    }
    open(): void {
        this.sidenav.open();
    }
    close(): void {
        this.sidenav.close();
    }

    @Input()
    opened = true;

    @Input()
    isAdmin = false;

}

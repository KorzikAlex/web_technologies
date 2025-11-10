import {Component} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";

@Component({
    selector: 'app-navbar',
    imports: [
        MatToolbar
    ],
    templateUrl: './navbar.html',
    styleUrl: './navbar.scss',
})
export class Toolbar {

}

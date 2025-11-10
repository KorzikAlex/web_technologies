import {Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {Toolbar} from "../toolbar/toolbar";

@Component({
    selector: 'app-layout',
    imports: [
        RouterOutlet,
        Toolbar
    ],
    templateUrl: './layout.html',
    styleUrl: './layout.scss',
})
export class Layout {

}

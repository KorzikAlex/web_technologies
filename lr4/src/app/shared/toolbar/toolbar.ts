import {Component} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";

@Component({
    selector: 'app-navbar',
    imports: [
        MatToolbar
    ],
    templateUrl: './toolbar.html',
    styleUrl: './toolbar.scss',
})
export class Toolbar {

}

import {Component} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-navbar',
    imports: [
        MatToolbar,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './toolbar.html',
    styleUrl: './toolbar.scss',
})
export class Toolbar {

}

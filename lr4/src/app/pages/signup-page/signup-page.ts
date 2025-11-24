import { Component } from '@angular/core';
import {SignupCard} from "../../shared/card/signup-card/signup-card";
import {NgOptimizedImage} from "@angular/common";
import { Sidenav } from "../../shared/sidenav/sidenav";

@Component({
  selector: 'app-signup-page',
  imports: [
    SignupCard,
    NgOptimizedImage,
    Sidenav
],
  templateUrl: './signup-page.html',
  styleUrl: './signup-page.scss',
})
export class SignupPage {

}

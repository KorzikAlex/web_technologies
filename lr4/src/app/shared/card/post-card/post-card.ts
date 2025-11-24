import { Component } from '@angular/core';
import { MatCard, MatCardHeader, MatCardContent, MatCardActions, MatCardFooter } from "@angular/material/card";

@Component({
  selector: 'app-post-card',
  imports: [MatCard, MatCardHeader, MatCardContent, MatCardActions, MatCardFooter],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard {

}

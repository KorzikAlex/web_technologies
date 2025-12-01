import { Component, EventEmitter, Output } from '@angular/core';
import { BaseCard } from '../base-card/base-card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardHeader, MatCardTitle } from "@angular/material/card";

export interface NewPost {
  imageUrl: string;
  text: string;
}

@Component({
  selector: 'app-create-post-card',
  imports: [
    BaseCard,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatButton,
    MatCardHeader,
    MatCardTitle
],
  templateUrl: './create-post-card.html',
  styleUrl: './create-post-card.scss',
})
export class CreatePostCard {
  protected imageUrl: string = '';
  protected postText: string = '';

  @Output() postCreated = new EventEmitter<NewPost>();

  onPublish(): void {
    if (this.postText.trim()) {
      this.postCreated.emit({
        imageUrl: this.imageUrl,
        text: this.postText,
      });
      this.onClear();
    }
  }

  onClear(): void {
    this.imageUrl = '';
    this.postText = '';
  }
}

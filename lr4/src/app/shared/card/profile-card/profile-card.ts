import { Component, Input } from '@angular/core';
import { BaseCard } from "../base-card/base-card";
import { MatCardTitle } from "@angular/material/card";
import { User } from '../../../data/interfaces/profile.interface';

@Component({
  selector: 'app-profile-card',
  imports: [BaseCard, MatCardTitle],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.scss',
})
export class ProfileCard {
  @Input() username: string = "Username";
  @Input() avatarUrl?: string = "https://material.angular.dev/assets/img/examples/shiba1.jpg";
  @Input() fullName: string = "Full Name";
  @Input() birthDate: string = "2000-01-01";
  @Input() email: string = ""

  @Input() userProfile: User | null = null;


}

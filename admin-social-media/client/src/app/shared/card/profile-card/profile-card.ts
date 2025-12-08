import { Component, Input } from '@angular/core';
import { BaseCard } from "../base-card/base-card";
import { MatCardTitle } from "@angular/material/card";
import { DatePipe } from '@angular/common';
import { User } from '../../../data/interfaces/profile.interface';

@Component({
  selector: 'app-profile-card',
  imports: [BaseCard, MatCardTitle, DatePipe],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.scss',
})
export class ProfileCard {
  @Input() userProfile: User | null = null;

  get username(): string {
    return this.userProfile?.username || 'Гость';
  }

  get fullName(): string {
    if (!this.userProfile) return '';
    return `${this.userProfile.surname} ${this.userProfile.name} ${this.userProfile.patronymic || ''}`.trim();
  }

  get email(): string {
    return this.userProfile?.email || '';
  }

  get birthDate(): string {
    return this.userProfile?.birthday ? new Date(this.userProfile.birthday).toISOString() : '';
  }

  get avatarUrl(): string {
    return this.userProfile?.avatarPath || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.username) + '&background=random';
  }

  get role(): string {
    return this.userProfile?.role === 'admin' ? 'Администратор' : 'Пользователь';
  }
}

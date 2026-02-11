import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
})
export class SettingsPageComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  userEmail = computed(() => this.auth.user()?.email ?? '');
  userId = computed(() => this.auth.user()?.id ?? '');

  // change password
  newPassword = signal('');
  saving = signal(false);
  msg = signal('');
  err = signal('');

  async changePassword() {
    const pass = this.newPassword().trim();
    if (!pass || pass.length < 6) {
      this.err.set('Password must be at least 6 characters.');
      return;
    }

    this.err.set('');
    this.msg.set('');
    this.saving.set(true);

    const { error } = await this.auth.updatePassword(pass);

    this.saving.set(false);

    if (error) {
      this.err.set(error.message ?? 'Failed to update password');
      return;
    }

    this.newPassword.set('');
    this.msg.set('Password updated successfully.');
  }

  async logout() {
    await this.auth.signOut();
    this.router.navigateByUrl('/auth');
  }
}

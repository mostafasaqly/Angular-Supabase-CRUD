import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.scss',
})
export class AuthPageComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  mode = signal<'login' | 'register'>('login');
  email = signal('');
  password = signal('');

  loading = computed(() => this.auth.loading());
  error = computed(() => this.auth.error());

  constructor() {
    if (this.auth.user()) {
    this.router.navigateByUrl('/app/tasks');
  }
  }

  async submit() {
    const email = this.email().trim();
    const password = this.password();

    if (!email || !password) return;

    const ok =
      this.mode() === 'register'
        ? await this.auth.signUp(email, password)
        : await this.auth.signIn(email, password);

    if (ok) {
      this.router.navigateByUrl('app/tasks');
    }
  }

  toggleMode() {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
  }
}

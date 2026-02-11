import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

type NavItem = { label: string; link: string; icon?: string };

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShellComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  userEmail = computed(() => this.auth.user()?.email ?? '');

  nav: NavItem[] = [
    { label: 'Overview', link: '/app/overview', icon: 'pi pi-chart-line' },
    { label: 'Tasks', link: '/app/tasks', icon: 'pi pi-check-square' },
    { label: 'Settings', link: '/app/settings', icon: 'pi pi-cog' },
  ];

  async logout() {
    await this.auth.signOut();
    this.router.navigateByUrl('/auth');
  }
  private routeChange = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)),
    { initialValue: null }
  );

  activeTitle = computed(() => {
    this.routeChange(); // re-run on navigation

    const currentUrl = this.router.url;
    const found = this.nav.find(n => currentUrl.startsWith(n.link));
    return found?.label ?? 'Dashboard';
  });
}

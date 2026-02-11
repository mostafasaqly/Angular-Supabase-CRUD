import { Routes } from '@angular/router';
import { TasksPageComponent } from './features/tasks/tasks-page/tasks-page';
import { AuthPageComponent } from './features/auth/auth-page/auth-page';
import { authGuard } from './core/auth/auth.guard';
import { AppShellComponent } from './layout/app-shell/app-shell';
import { OverviewPageComponent } from './features/overview/overview-page/overview-page';
import { SettingsPageComponent } from './features/settings/settings-page/settings-page';

export const routes: Routes = [
  { path: '', redirectTo: 'app', pathMatch: 'full' },

  { path: 'auth', component: AuthPageComponent },

  {
    path: 'app',
    component: AppShellComponent,
    canMatch: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewPageComponent },
      { path: 'tasks', component: TasksPageComponent },
      { path: 'settings', component: SettingsPageComponent }
    ],
  },
];

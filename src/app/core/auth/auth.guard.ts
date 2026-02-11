import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // لسه بنحمّل session؟ امنع القرار لحظياً
  if (!auth.ready()) return true;

  // جاهزين: قرر
  if (auth.user()) return true;

  return router.parseUrl('/auth');
};

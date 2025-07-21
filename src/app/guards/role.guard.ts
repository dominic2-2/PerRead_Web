import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const userStr = localStorage.getItem('user');
    const router = inject(Router);
    if (!userStr) {
      router.navigate(['/auth/login']);
      return false;
    }
    const user = JSON.parse(userStr);
    if (!allowedRoles.includes(user.role)) {
      // Nếu là staff thì về staff-home, nếu không thì về dashboard
      if (user.role === 'Staff') {
        router.navigate(['/staff-home']);
      } else if (user.role === 'Admin') {
        router.navigate(['/dashboard']);
      }
      return false;
    }
    return true;
  };
} 
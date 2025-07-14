import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const userData = localStorage.getItem('user');
    if (!userData) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    try {
      const user = JSON.parse(userData);
      if (user.role === 'Admin') {
        return true;
      } else {
        this.router.navigate(['/auth/login']);
        return false;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
} 
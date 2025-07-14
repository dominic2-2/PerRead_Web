import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule
  ]
})
export class AppComponent {
  title = 'PerReadWeb';
  
  constructor(private router: Router) {}
  
  get isLoginPage(): boolean {
    return this.router.url.includes('/auth/login');
  }
  
  get userRole(): string | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr).role;
    } catch {
      return null;
    }
  }

  get currentUser(): any | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      return {
        avatarUrl: user.avatarUrl,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      };
    } catch {
      return null;
    }
  }
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

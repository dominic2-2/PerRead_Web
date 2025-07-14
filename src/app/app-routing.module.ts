import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./pages/auth/auth-routing.module').then(m => m.AuthRoutingModule) },
  { path: 'books', canActivate: [authGuard, roleGuard(['Staff'])], loadChildren: () => import('./pages/book-management/book-management-routing.module').then(m => m.BookManagementRoutingModule) },
  { path: 'pricing', canActivate: [authGuard, roleGuard(['Staff'])], loadChildren: () => import('./pages/price-package/price-package-routing.module').then(m => m.PricePackageRoutingModule) },
  { path: 'payments', canActivate: [authGuard, roleGuard(['Staff'])], loadChildren: () => import('./pages/payment/payment-routing.module').then(m => m.PaymentRoutingModule) },
  { path: 'support', canActivate: [authGuard, roleGuard(['Staff'])], loadChildren: () => import('./pages/support/support-routing.module').then(m => m.SupportRoutingModule) },
  { path: 'accounts', canActivate: [authGuard, roleGuard(['Admin'])], loadChildren: () => import('./pages/account-management/account-management-routing.module').then(m => m.AccountManagementRoutingModule) },
  { path: 'dashboard', canActivate: [authGuard, roleGuard(['Admin'])], loadChildren: () => import('./pages/dashboard/dashboard-routing.module').then(m => m.DashboardRoutingModule) },
  { path: 'staff-home', canActivate: [authGuard, roleGuard(['Staff'])], loadChildren: () => import('./pages/staff-home/staff-home-routing.module').then(m => m.StaffHomeRoutingModule) },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

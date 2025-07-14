import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserCreateComponent } from './user-create/user-create.component';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: '', component: UserListComponent, canActivate: [AdminGuard] },
  { path: 'create', component: UserCreateComponent, canActivate: [AdminGuard] },
  { path: ':id', component: UserDetailComponent, canActivate: [AdminGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountManagementRoutingModule { } 
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffHomeComponent } from './staff-home.component';
import { StaffGuard } from './guards/staff.guard';

const routes: Routes = [
  { path: '', component: StaffHomeComponent, canActivate: [StaffGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffHomeRoutingModule {} 
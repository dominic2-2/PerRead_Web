import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PriceFormComponent } from './price-form/price-form.component';
import { PackageListComponent } from './package-list/package-list.component';

const routes: Routes = [
  { path: 'set-price', component: PriceFormComponent },
  { path: 'packages', component: PackageListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PricePackageRoutingModule {} 
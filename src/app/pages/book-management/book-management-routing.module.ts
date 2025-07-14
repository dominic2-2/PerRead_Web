import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookListComponent } from './book-list/book-list.component';
import { BookFormComponent } from './book-form/book-form.component';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { MetadataComponent } from './metadata/metadata.component';
import { StaffGuard } from './guards/staff.guard';

const routes: Routes = [
  { path: '', component: BookListComponent, canActivate: [StaffGuard] },
  { path: 'add', component: BookFormComponent, canActivate: [StaffGuard] },
  { path: 'edit/:id', component: BookFormComponent, canActivate: [StaffGuard] },
  { path: 'detail/:id', component: BookDetailComponent, canActivate: [StaffGuard] },
  { path: 'metadata/:id', component: MetadataComponent, canActivate: [StaffGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookManagementRoutingModule {} 
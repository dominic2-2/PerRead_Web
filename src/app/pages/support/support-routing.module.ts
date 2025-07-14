import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketReplyComponent } from './ticket-reply/ticket-reply.component';

const routes: Routes = [
  { path: 'tickets', component: TicketListComponent },
  { path: 'reply/:id', component: TicketReplyComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupportRoutingModule {} 
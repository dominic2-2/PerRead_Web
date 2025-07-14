import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { RefundComponent } from './refund/refund.component';

const routes: Routes = [
  { path: 'transactions', component: TransactionListComponent },
  { path: 'refund', component: RefundComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule {} 
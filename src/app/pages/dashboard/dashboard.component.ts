import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RevenueComponent } from './revenue/revenue.component';
import { UsageComponent } from './usage/usage.component';
import { SubscriptionOverviewComponent } from './subscription-overview/subscription-overview.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, RevenueComponent, UsageComponent, SubscriptionOverviewComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {} 
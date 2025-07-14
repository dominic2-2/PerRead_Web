import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: string; // "User", "Staff", "Admin"
  isActive: boolean;
  subscriptionPlan?: string; // "Free", "Basic", "Premium"
  subscriptionExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiResponse {
  total: number;
  data: User[];
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'user', 'email', 'role', 'subscriptionPlan', 'createdAt', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  
  searchForm: FormGroup;
  filterForm: FormGroup;
  
  roles = ['Admin', 'Staff', 'User'];
  subscriptionPlans = ['Free', 'Basic', 'Premium'];
  activeStatuses = [true, false];
  sortOptions = [
    { value: 'created_at-asc', label: 'Ngày tạo (Tăng dần)' },
    { value: 'created_at-desc', label: 'Ngày tạo (Giảm dần)' },
    { value: 'updated_at-asc', label: 'Ngày cập nhật (Tăng dần)' },
    { value: 'updated_at-desc', label: 'Ngày cập nhật (Giảm dần)' }
  ];

  isLoading = false;
  totalItems = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
    
    this.filterForm = this.fb.group({
      role: [''],
      subscriptionPlan: [''],
      isActive: [''],
      sortBy: ['created_at-desc']
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.setupSearchAndFilter();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers() {
    this.isLoading = true;
    
    const searchTerm = this.searchForm.get('searchTerm')?.value;
    const roleFilter = this.filterForm.get('role')?.value;
    const subscriptionFilter = this.filterForm.get('subscriptionPlan')?.value;
    const activeFilter = this.filterForm.get('isActive')?.value;
    const sortValue = this.filterForm.get('sortBy')?.value;
    
    const [sortField, sortDirection] = sortValue ? sortValue.split('-') : ['created_at', 'desc'];
    const page = this.paginator?.pageIndex + 1 || 1;
    const pageSize = this.paginator?.pageSize || 10;

    const params: any = {
      page,
      pageSize,
      sort: sortField,
      desc: sortDirection === 'desc'
    };

    if (searchTerm) params.keyword = searchTerm;
    if (roleFilter) params.role = roleFilter;
    if (subscriptionFilter) params.plan = subscriptionFilter;
    if (activeFilter !== '') params.isActive = activeFilter;

    this.http.get<ApiResponse>(`${environment.apiUrl}/api/user`, { params })
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.data;
          this.totalItems = response.total;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.isLoading = false;
          this.snackBar.open('Không thể tải danh sách người dùng!', 'Đóng', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  setupSearchAndFilter() {
    this.searchForm.get('searchTerm')?.valueChanges.subscribe(() => {
      this.loadUsers();
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.loadUsers();
    });
  }

  onSortChange() {
    this.loadUsers();
  }

  onPageChange() {
    this.loadUsers();
  }

  viewDetail(userId: string) {
    this.router.navigate(['/accounts', userId]);
  }

  createNew() {
    this.router.navigate(['/accounts/create']);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/default-avatar.png';
    }
  }

  clearFilters() {
    this.searchForm.reset();
    this.filterForm.reset({ sortBy: 'created_at-desc' });
    this.loadUsers();
  }
} 
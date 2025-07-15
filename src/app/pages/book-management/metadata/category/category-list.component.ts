import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DatePipe, CommonModule } from '@angular/common';
import { CategoryDialogComponent } from './category-dialog.component';

interface Category {
  id: string;
  name: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface CategoryApiResponse {
  total: number;
  data: Category[];
}

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule
  ]
})
export class CategoryListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'name', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Category>([]);
  totalItems = 0;
  isLoading = false;

  searchForm: FormGroup;
  filterForm: FormGroup;
  sortOptions = [
    { value: 'name', label: 'Tên' },
    { value: 'created_at', label: 'Ngày tạo' },
    { value: 'updated_at', label: 'Ngày cập nhật' },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.searchForm = this.fb.group({
      keyword: ['']
    });
    this.filterForm = this.fb.group({
      sortBy: ['created_at'],
      desc: [true]
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.setupSearchAndFilter();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  toDate(val: any): Date | undefined {
    if (!val) return undefined;
    if (val instanceof Date) return val;
    if (typeof val === 'string' || typeof val === 'number') return new Date(val);
    if (val.seconds) return new Date(val.seconds * 1000);
    return undefined;
  }

  loadCategories() {
    this.isLoading = true;
    const keyword = this.searchForm.get('keyword')?.value;
    const sortValue = this.filterForm.get('sortBy')?.value;
    const desc = this.filterForm.get('desc')?.value;
    const [sort] = sortValue ? sortValue.split('-') : ['created_at'];
    const page = this.paginator?.pageIndex + 1 || 1;
    const pageSize = this.paginator?.pageSize || 10;
    const params: any = { page, pageSize, sort, desc };
    if (keyword) params.keyword = keyword;
    
    this.http.get<CategoryApiResponse>(`${environment.apiUrl}/api/category`, { params }).subscribe({
      next: (res) => {
        this.dataSource.data = res.data.map(category => ({
          ...category,
          createdAt: this.toDate(category.createdAt),
          updatedAt: this.toDate(category.updatedAt)
        }));
        this.totalItems = res.total;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Không thể tải danh sách thể loại!', 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  setupSearchAndFilter() {
    this.searchForm.get('keyword')?.valueChanges.subscribe(() => this.loadCategories());
    this.filterForm.valueChanges.subscribe(() => this.loadCategories());
  }

  onSortChange() {
    this.loadCategories();
  }

  onPageChange() {
    this.loadCategories();
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '500px',
      data: { mode: 'create' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') this.loadCategories();
    });
  }

  openDetailDialog(category: Category) {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '500px',
      data: { mode: 'detail', category }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') this.loadCategories();
    });
  }

  deleteCategory(category: Category) {
    if (!confirm(`Bạn có chắc muốn xóa thể loại "${category.name}"?`)) return;
    this.http.delete(`${environment.apiUrl}/api/category/${category.id}`).subscribe({
      next: () => {
        this.snackBar.open('Đã xóa thể loại!', 'Đóng', { duration: 3000 });
        this.loadCategories();
      },
      error: (err) => {
        this.snackBar.open('Không thể xóa thể loại!', 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }
} 
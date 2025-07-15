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
import { PublisherDialogComponent } from './publisher-dialog.component';

interface Publisher {
  id: string;
  name: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface PublisherApiResponse {
  total: number;
  data: Publisher[];
}

@Component({
  selector: 'app-publisher-list',
  templateUrl: './publisher-list.component.html',
  styleUrls: ['./publisher-list.component.css'],
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
export class PublisherListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'name', 'email', 'phone', 'website', 'actions'];
  dataSource = new MatTableDataSource<Publisher>([]);
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
      website: [''],
      sortBy: ['name'],
      desc: [false]
    });
  }

  ngOnInit() {
    this.loadPublishers();
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

  loadPublishers() {
    this.isLoading = true;
    const keyword = this.searchForm.get('keyword')?.value;
    const website = this.filterForm.get('website')?.value;
    const sortValue = this.filterForm.get('sortBy')?.value;
    const desc = this.filterForm.get('desc')?.value;
    const [sort] = sortValue ? sortValue.split('-') : ['name'];
    const page = this.paginator?.pageIndex + 1 || 1;
    const pageSize = this.paginator?.pageSize || 10;
    const params: any = { page, pageSize, sort, desc };
    if (keyword) params.keyword = keyword;
    if (website) params.website = website;
    
    this.http.get<PublisherApiResponse>(`${environment.apiUrl}/api/publisher`, { params }).subscribe({
      next: (res) => {
        this.dataSource.data = res.data.map(publisher => ({
          ...publisher,
          createdAt: this.toDate(publisher.createdAt),
          updatedAt: this.toDate(publisher.updatedAt)
        }));
        this.totalItems = res.total;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Không thể tải danh sách nhà xuất bản!', 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  setupSearchAndFilter() {
    this.searchForm.get('keyword')?.valueChanges.subscribe(() => this.loadPublishers());
    this.filterForm.valueChanges.subscribe(() => this.loadPublishers());
  }

  onSortChange() {
    this.loadPublishers();
  }

  onPageChange() {
    this.loadPublishers();
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(PublisherDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') this.loadPublishers();
    });
  }

  openDetailDialog(publisher: Publisher) {
    const dialogRef = this.dialog.open(PublisherDialogComponent, {
      width: '600px',
      data: { mode: 'detail', publisher }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') this.loadPublishers();
    });
  }

  deletePublisher(publisher: Publisher) {
    if (!confirm(`Bạn có chắc muốn xóa nhà xuất bản "${publisher.name}"?`)) return;
    this.http.delete(`${environment.apiUrl}/api/publisher/${publisher.id}`).subscribe({
      next: () => {
        this.snackBar.open('Đã xóa nhà xuất bản!', 'Đóng', { duration: 3000 });
        this.loadPublishers();
      },
      error: (err) => {
        this.snackBar.open('Không thể xóa nhà xuất bản!', 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }
} 
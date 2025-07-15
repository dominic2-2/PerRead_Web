import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

interface Author {
  id: string;
  name: string;
  bio?: string;
  email?: string;
  birthYear?: number;
  deathYear?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface Category {
  id: string;
  name: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface Publisher {
  id: string;
  name: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface Book {
  id: string;
  title: string;
  authors: Author[];
  publisher: Publisher;
  categories: Category[];
  language: string;
  edition: string;
  isbn: string;
  pages: number;
  summary: string;
  coverUrl: string;
  fileUrl: string;
  fileSize: number;
  price: number;
  availability: boolean;
  tags: string[];
  averageRating?: number;
  totalReviews?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface BookApiResponse {
  total: number;
  data: Book[];
}

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ReactiveFormsModule
  ]
})
export class BookListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['title', 'authors', 'publisher', 'categories', 'price', 'availability', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Book>([]);
  totalItems = 0;
  isLoading = false;
  showFilter = false;

  searchForm: FormGroup;
  filterForm: FormGroup;
  sortOptions = [
    { value: 'title', label: 'Tên sách' },
    { value: 'price', label: 'Giá' },
    { value: 'created_at', label: 'Ngày tạo' },
    { value: 'updated_at', label: 'Ngày cập nhật' },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      keyword: ['']
    });
    this.filterForm = this.fb.group({
      sortBy: ['created_at'],
      sortDir: ['desc'],
      availability: [''],
      priceMin: [''],
      priceMax: ['']
    });
  }

  ngOnInit() {
    this.loadBooks();
    this.setupSearchAndFilter();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadBooks() {
    this.isLoading = true;
    const keyword = this.searchForm.get('keyword')?.value;
    const sortBy = this.filterForm.get('sortBy')?.value;
    const sortDir = this.filterForm.get('sortDir')?.value;
    const sort = [`${sortBy}:${sortDir}`];
    const availability = this.filterForm.get('availability')?.value;
    const priceMin = this.filterForm.get('priceMin')?.value;
    const priceMax = this.filterForm.get('priceMax')?.value;
    const page = this.paginator?.pageIndex + 1 || 1;
    const pageSize = this.paginator?.pageSize || 10;
    const params: any = { page, pageSize, sort };
    if (keyword) params.keyword = keyword;
    if (availability !== '') params.availability = availability;
    if (priceMin) params.priceMin = priceMin;
    if (priceMax) params.priceMax = priceMax;

    this.http.get<BookApiResponse>(`${environment.apiUrl}/api/book`, { params }).subscribe({
      next: (res) => {
        // Không cần map lại, dữ liệu đã đúng dạng Book
        this.dataSource.data = res.data;
        this.totalItems = res.total;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Không thể tải danh sách sách!', 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  setupSearchAndFilter() {
    this.searchForm.get('keyword')?.valueChanges.subscribe(() => this.loadBooks());
    this.filterForm.valueChanges.subscribe(() => this.loadBooks());
  }

  onPageChange() {
    this.loadBooks();
  }

  onSortChange() {
    this.loadBooks();
  }

  goToAdd() {
    this.router.navigate(['/books/add']);
  }

  goToDetail(book: Book) {
    this.router.navigate(['/books/detail', book.id]);
  }

  deleteBook(book: Book) {
    if (!confirm(`Bạn có chắc muốn xóa sách "${book.title}"?`)) return;
    this.http.delete(`${environment.apiUrl}/api/book/${book.id}`).subscribe({
      next: () => {
        this.snackBar.open('Đã xóa sách!', 'Đóng', { duration: 3000 });
        this.loadBooks();
      },
      error: (err) => {
        this.snackBar.open('Không thể xóa sách!', 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  backToList() {
    this.router.navigate(['/books']);
  }

  getAuthorNames(book: Book): string {
    return book.authors?.map(a => a.name).join(', ') || '';
  }
  getCategoryNames(book: Book): string {
    return book.categories?.map(c => c.name).join(', ') || '';
  }
} 
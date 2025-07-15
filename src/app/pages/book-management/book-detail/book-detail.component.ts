import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.css'],
  standalone: true,
  imports: [
    // Angular Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule
  ]
})
export class BookDetailComponent implements OnInit {
  bookForm!: FormGroup;
  isLoading = true;
  isEdit = false;
  isSaving = false;
  bookId!: string;
  coverPreview: string = '';
  fileName: string = '';

  authors: any[] = [];
  categories: any[] = [];
  publishers: any[] = [];
  languages: { code: string, name: string }[] = [];

  filteredAuthors: any[] = [];
  filteredCategories: any[] = [];
  filteredPublishers: any[] = [];
  filteredLanguages: { code: string, name: string }[] = [];

  authorSearch = '';
  categorySearch = '';
  publisherSearch = '';
  languageSearch = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private fileUpload: FileUploadService
  ) {}

  ngOnInit() {
    this.bookId = this.route.snapshot.paramMap.get('id')!;
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      authorIds: [[]],
      publisherId: [''],
      categoryIds: [[]],
      language: [''],
      edition: [''],
      isbn: [''],
      pages: [0],
      summary: [''],
      coverUrl: [''],
      fileUrl: [''],
      fileSize: [0],
      price: [0],
      availability: [true],
      tags: [[]]
    });
    this.loadAuthors();
    this.loadCategories();
    this.loadPublishers();
    this.loadLanguages();
    this.loadBook();
    this.bookForm.disable();
  }

  loadAuthors() {
    this.http.get<any[]>(`${environment.apiUrl}/api/author/list`).subscribe(data => {
      this.authors = data;
      this.filteredAuthors = data;
    });
  }
  loadCategories() {
    this.http.get<any[]>(`${environment.apiUrl}/api/category/list`).subscribe(data => {
      this.categories = data;
      this.filteredCategories = data;
    });
  }
  loadPublishers() {
    this.http.get<any[]>(`${environment.apiUrl}/api/publisher/list`).subscribe(data => {
      this.publishers = data;
      this.filteredPublishers = data;
    });
  }
  loadLanguages() {
    this.http.get<any>('https://translate.googleapis.com/translate_a/l?client=webapp').subscribe((data) => {
      if (data && data.tl) {
        this.languages = Object.entries(data.tl).map(([code, name]) => ({
          code,
          name: 'Tiếng ' + String(name)
        }));
        this.filteredLanguages = this.languages;
      }
    });
  }

  onAuthorSearch(val: string) {
    this.authorSearch = val;
    this.filteredAuthors = this.authors.filter(a =>
      a.name.toLowerCase().includes(val.toLowerCase())
    );
  }
  onCategorySearch(val: string) {
    this.categorySearch = val;
    this.filteredCategories = this.categories.filter(c =>
      c.name.toLowerCase().includes(val.toLowerCase())
    );
  }
  onPublisherSearch(val: string) {
    this.publisherSearch = val;
    this.filteredPublishers = this.publishers.filter(p =>
      p.name.toLowerCase().includes(val.toLowerCase())
    );
  }
  onLanguageSearch(val: string) {
    this.languageSearch = val;
    this.filteredLanguages = this.languages.filter(l =>
      l.name.toLowerCase().includes(val.toLowerCase()) || l.code.toLowerCase().includes(val.toLowerCase())
    );
  }

  loadBook() {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/api/book/${this.bookId}`).subscribe({
      next: (book) => {
        // Map lại các trường cho form
        this.bookForm.patchValue({
          ...book,
          authorIds: book.authors ? book.authors.map((a: any) => a.id) : [],
          categoryIds: book.categories ? book.categories.map((c: any) => c.id) : [],
          publisherId: book.publisher ? book.publisher.id : '',
          tags: Array.isArray(book.tags) ? book.tags : (typeof book.tags === 'string' ? book.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0) : [])
        });
        this.coverPreview = book.coverUrl;
        this.fileName = book.fileUrl ? book.fileUrl.split('/').pop() : '';
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Không thể tải chi tiết sách!', 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
        this.isLoading = false;
      }
    });
  }

  enableEdit() {
    this.isEdit = true;
    this.bookForm.enable();
  }

  cancelEdit() {
    this.isEdit = false;
    this.loadBook();
    this.bookForm.disable();
  }

  save() {
    if (this.bookForm.invalid) return;
    this.isSaving = true;
    let value = this.bookForm.getRawValue();
    // Đảm bảo tags là mảng chuỗi
    if (typeof value.tags === 'string') {
      value.tags = value.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0);
    }
    this.http.put(`${environment.apiUrl}/api/book/${this.bookId}`, value).subscribe({
      next: () => {
        this.snackBar.open('Cập nhật sách thành công!', 'Đóng', { duration: 3000 });
        this.isEdit = false;
        this.isSaving = false;
        this.bookForm.disable();
      },
      error: () => {
        this.snackBar.open('Cập nhật sách thất bại!', 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
        this.isSaving = false;
      }
    });
  }

  onCoverChange(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    const validation = this.fileUpload.validateFile(file, ['image/jpeg', 'image/png', 'image/gif'], 5);
    if (!validation.valid) {
      this.snackBar.open(validation.error || 'File không hợp lệ!', 'Đóng', { duration: 4000, panelClass: ['error-snackbar'] });
      return;
    }
    this.fileUpload.uploadImage(file).subscribe(res => {
      if (res.success && res.url) {
        this.bookForm.patchValue({ coverUrl: res.url });
        this.coverPreview = res.url;
        this.snackBar.open('Tải ảnh bìa thành công!', 'Đóng', { duration: 2000 });
      } else {
        this.snackBar.open(res.error || 'Tải ảnh bìa thất bại!', 'Đóng', { duration: 4000, panelClass: ['error-snackbar'] });
      }
    });
  }

  onFileChange(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    // Cho phép mọi loại file, tối đa 50MB
    const validation = this.fileUpload.validateFile(file, [], 50);
    if (!validation.valid) {
      this.snackBar.open(validation.error || 'File không hợp lệ!', 'Đóng', { duration: 4000, panelClass: ['error-snackbar'] });
      return;
    }
    this.fileUpload.uploadDocument(file).subscribe(res => {
      if (res.success && res.url) {
        this.bookForm.patchValue({ fileUrl: res.url, fileSize: file.size });
        this.fileName = file.name;
        this.snackBar.open('Tải file sách thành công!', 'Đóng', { duration: 2000 });
      } else {
        this.snackBar.open(res.error || 'Tải file sách thất bại!', 'Đóng', { duration: 4000, panelClass: ['error-snackbar'] });
      }
    });
  }

  clearCoverUrl() {
    this.bookForm.patchValue({ coverUrl: '' });
    this.coverPreview = '';
  }
  clearFileUrl() {
    this.bookForm.patchValue({ fileUrl: '', fileSize: 0 });
    this.fileName = '';
  }

  backToList() {
    this.router.navigate(['/books']);
  }
} 
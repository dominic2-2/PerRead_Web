import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-book-form',
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css'],
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    FormsModule
  ]
})
export class BookFormComponent implements OnInit {
  @ViewChild('coverUploadInput') coverUploadInput!: ElementRef<HTMLInputElement>;
  bookForm!: FormGroup;
  isSaving = false;
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
    private router: Router,
    private snackBar: MatSnackBar,
    private fileUpload: FileUploadService
  ) {}

  ngOnInit() {
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
          name: String(name)
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

  save() {
    if (this.bookForm.invalid) return;
    this.isSaving = true;
    let value = this.bookForm.getRawValue();

    if (typeof value.tags === 'string') {
      value.tags = value.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0);
    }

    this.http.post(`${environment.apiUrl}/api/book`, value).subscribe({
      next: () => {
        this.snackBar.open('Tạo sách thành công!', 'Đóng', { duration: 3000 });
        this.isSaving = false;
        this.router.navigate(['/books']);
      },
      error: () => {
        this.snackBar.open('Tạo sách thất bại!', 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
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
    // Kiểm tra định dạng epub
    if (!file.name.toLowerCase().endsWith('.epub')) {
      this.snackBar.open('Chỉ chấp nhận file .epub!', 'Đóng', { duration: 4000, panelClass: ['error-snackbar'] });
      return;
    }
    // Cho phép file epub tối đa 50MB
    const validation = this.fileUpload.validateFile(file, ['application/epub+zip'], 50);
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

  backToList() {
    this.router.navigate(['/books']);
  }

  // Xóa link ảnh bìa
  clearCoverUrl() {
    this.bookForm.patchValue({ coverUrl: '' });
    this.coverPreview = '';
  }

  clearFileUrl() {
    this.bookForm.patchValue({ fileUrl: '', fileSize: 0 });
    this.fileName = '';
  }
} 
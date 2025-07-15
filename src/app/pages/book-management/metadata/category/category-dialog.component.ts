import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-dialog',
  template: `
  <h2 mat-dialog-title *ngIf="data.mode === 'create'">Thêm thể loại mới</h2>
  <h2 mat-dialog-title *ngIf="data.mode === 'detail'">Chi tiết thể loại</h2>
  <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" mat-dialog-content class="compact-modal-form">
    <mat-form-field appearance="outline" class="full-width small-input" style="margin-top: 10px;">
      <mat-label>Tên thể loại</mat-label>
      <input matInput formControlName="name" [readonly]="isDetail && !isEdit" placeholder="Nhập tên thể loại">
    </mat-form-field>
    <div *ngIf="isDetail" class="meta-info">
      <div><b>Ngày tạo:</b> {{data.category?.createdAt | date:'dd/MM/yyyy HH:mm'}}</div>
      <div><b>Ngày cập nhật:</b> {{data.category?.updatedAt | date:'dd/MM/yyyy HH:mm'}}</div>
    </div>
    <div align="end" class="compact-modal-actions">
      <button mat-button mat-dialog-close class="small-btn" style="margin-right: 10px;">Đóng</button>
      <button mat-button color="primary" *ngIf="isDetail && !isEdit" (click)="onEdit()" class="small-btn">Sửa</button>
      <button mat-raised-button color="primary" *ngIf="isCreate || (isDetail && isEdit)" type="submit" [disabled]="categoryForm.invalid || isLoading" class="small-btn">
        {{ isCreate ? 'Tạo mới' : 'Lưu thay đổi' }}
      </button>
    </div>
  </form>
  `,
  styles: [`
    .full-width { width: 100%; }
    .small-input { min-height: 36px; font-size: 14px; }
    .compact-modal-form { padding: 20px; }
    .compact-modal-actions { margin-top: -10px; }
    .small-btn { min-width: 64px; height: 32px; font-size: 13px; padding: 0 12px; }
    .meta-info { font-size: 13px; color: #666; margin-bottom: 4px; }
    mat-form-field { margin-bottom: 10px; }
  `],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, DatePipe]
})
export class CategoryDialogComponent {
  categoryForm: FormGroup;
  isEdit = false;
  isLoading = false;
  get isCreate() { return this.data.mode === 'create'; }
  get isDetail() { return this.data.mode === 'detail'; }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.categoryForm = this.fb.group({
      name: [{ value: data.category?.name || '', disabled: this.isDetail && !this.isEdit }, Validators.required],
    });
  }

  onEdit() {
    this.isEdit = true;
    this.categoryForm.get('name')?.enable();
  }

  onSubmit() {
    if (this.categoryForm.invalid) return;
    this.isLoading = true;
    const value = this.categoryForm.getRawValue();
    
    if (this.isCreate) {
      this.http.post(`${environment.apiUrl}/api/category`, value).subscribe({
        next: () => {
          this.snackBar.open('Tạo thể loại thành công!', 'Đóng', { duration: 3000 });
          this.isLoading = false;
          this.dialogRef.close('refresh');
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(err.status === 409 ? 'Thể loại đã tồn tại!' : 'Tạo thể loại thất bại!', 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
        }
      });
    } else if (this.isDetail && this.isEdit) {
      this.http.put(`${environment.apiUrl}/api/category/${this.data.category.id}`, value).subscribe({
        next: () => {
          this.snackBar.open('Cập nhật thể loại thành công!', 'Đóng', { duration: 3000 });
          this.isLoading = false;
          this.dialogRef.close('refresh');
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(err.status === 409 ? 'Thể loại đã tồn tại!' : 'Cập nhật thể loại thất bại!', 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }
} 
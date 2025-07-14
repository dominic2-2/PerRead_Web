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
  selector: 'app-author-dialog',
  template: `
  <h2 mat-dialog-title *ngIf="data.mode === 'create'">Thêm tác giả mới</h2>
  <h2 mat-dialog-title *ngIf="data.mode === 'detail'">Chi tiết tác giả</h2>
  <form [formGroup]="authorForm" (ngSubmit)="onSubmit()" mat-dialog-content class="compact-modal-form">
    <mat-form-field appearance="outline" class="full-width small-input" style="margin-top: 10px;">
      <mat-label>Tên tác giả</mat-label>
      <input matInput formControlName="name" [readonly]="isDetail && !isEdit">
    </mat-form-field>
    <div style="display: flex; gap: 18px;">
      <mat-form-field appearance="outline" class="half-width small-input">
        <mat-label>Năm sinh</mat-label>
        <input matInput type="number" formControlName="birthYear" [readonly]="isDetail && !isEdit">
      </mat-form-field>
      <mat-form-field appearance="outline" class="half-width small-input">
        <mat-label>Năm mất</mat-label>
        <input matInput type="number" formControlName="deathYear" [readonly]="isDetail && !isEdit">
      </mat-form-field>
    </div>
    <mat-form-field appearance="outline" class="full-width small-input">
      <mat-label>Email</mat-label>
      <input matInput formControlName="email" [readonly]="isDetail && !isEdit">
    </mat-form-field>
    <mat-form-field appearance="outline" class="full-width small-input">
      <mat-label>Tiểu sử</mat-label>
      <textarea matInput formControlName="bio" [readonly]="isDetail && !isEdit" rows="2"></textarea>
    </mat-form-field>
    <div *ngIf="isDetail" class="meta-info">
      <div><b>Ngày tạo:</b> {{data.author?.createdAt | date:'dd/MM/yyyy HH:mm'}}</div>
      <div><b>Ngày cập nhật:</b> {{data.author?.updatedAt | date:'dd/MM/yyyy HH:mm'}}</div>
    </div>
    <div align="end" class="compact-modal-actions">
      <button mat-button mat-dialog-close class="small-btn" style="margin-right: 10px;">Đóng</button>
      <button mat-button color="primary" *ngIf="isDetail && !isEdit" (click)="onEdit()" class="small-btn">Sửa</button>
      <button mat-raised-button color="primary" *ngIf="isCreate || (isDetail && isEdit)" type="submit" [disabled]="authorForm.invalid || isLoading" class="small-btn">
        {{ isCreate ? 'Tạo mới' : 'Lưu thay đổi' }}
      </button>
    </div>
  </form>
  `,
  styles: [`
    .full-width { width: 100%; }
    .half-width { width: 48%; }
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
export class AuthorDialogComponent {
  authorForm: FormGroup;
  isEdit = false;
  isLoading = false;
  get isCreate() { return this.data.mode === 'create'; }
  get isDetail() { return this.data.mode === 'detail'; }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AuthorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.authorForm = this.fb.group({
      name: [{ value: data.author?.name || '', disabled: this.isDetail && !this.isEdit }, Validators.required],
      email: [{ value: data.author?.email || '', disabled: this.isDetail && !this.isEdit }],
      bio: [{ value: data.author?.bio || '', disabled: this.isDetail && !this.isEdit }],
      birthYear: [{ value: data.author?.birthYear || '', disabled: this.isDetail && !this.isEdit }],
      deathYear: [{ value: data.author?.deathYear || '', disabled: this.isDetail && !this.isEdit }],
    });
  }

  onEdit() {
    this.isEdit = true;
    this.authorForm.get('name')?.enable();
    this.authorForm.get('email')?.enable();
    this.authorForm.get('bio')?.enable();
    this.authorForm.get('birthYear')?.enable();
    this.authorForm.get('deathYear')?.enable();
  }

  onSubmit() {
    if (this.authorForm.invalid) return;
    this.isLoading = true;
    const value = this.authorForm.getRawValue();
    if (this.isCreate) {
      this.http.post(`${environment.apiUrl}/api/author`, value).subscribe({
        next: () => {
          this.snackBar.open('Tạo tác giả thành công!', 'Đóng', { duration: 3000 });
          this.isLoading = false;
          this.dialogRef.close('refresh');
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(err.status === 409 ? 'Tác giả đã tồn tại!' : 'Tạo tác giả thất bại!', 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
        }
      });
    } else if (this.isDetail && this.isEdit) {
      this.http.put(`${environment.apiUrl}/api/author/${this.data.author.id}`, value).subscribe({
        next: () => {
          this.snackBar.open('Cập nhật tác giả thành công!', 'Đóng', { duration: 3000 });
          this.isLoading = false;
          this.dialogRef.close('refresh');
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(err.status === 409 ? 'Tác giả đã tồn tại!' : 'Cập nhật tác giả thất bại!', 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }
} 
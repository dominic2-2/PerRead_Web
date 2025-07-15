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
  selector: 'app-publisher-dialog',
  template: `
  <h2 mat-dialog-title *ngIf="data.mode === 'create'">Thêm nhà xuất bản mới</h2>
  <h2 mat-dialog-title *ngIf="data.mode === 'detail'">Chi tiết nhà xuất bản</h2>
  <form [formGroup]="publisherForm" (ngSubmit)="onSubmit()" mat-dialog-content class="compact-modal-form">
    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width small-input" style="margin-top: 10px;">
      <mat-label>Tên nhà xuất bản</mat-label>
      <input matInput formControlName="name" [readonly]="isDetail && !isEdit" placeholder="Nhập tên nhà xuất bản">
    </mat-form-field>
    
    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width small-input">
      <mat-label>Địa chỉ</mat-label>
      <input matInput formControlName="address" [readonly]="isDetail && !isEdit" placeholder="Nhập địa chỉ">
    </mat-form-field>
    
    <div style="display: flex; gap: 18px;">
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="half-width small-input">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" [readonly]="isDetail && !isEdit" placeholder="Nhập email">
      </mat-form-field>
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="half-width small-input">
        <mat-label>Điện thoại</mat-label>
        <input matInput formControlName="phone" [readonly]="isDetail && !isEdit" placeholder="Nhập số điện thoại">
      </mat-form-field>
    </div>
    
    <mat-form-field appearance="outline" class="full-width small-input">
      <mat-label>Website</mat-label>
      <input matInput formControlName="website" [readonly]="isDetail && !isEdit" placeholder="Nhập URL website">
    </mat-form-field>
    
    <div *ngIf="isDetail" class="meta-info">
      <div><b>Ngày tạo:</b> {{data.publisher?.createdAt | date:'dd/MM/yyyy HH:mm'}}</div>
      <div><b>Ngày cập nhật:</b> {{data.publisher?.updatedAt | date:'dd/MM/yyyy HH:mm'}}</div>
    </div>
    
    <div align="end" class="compact-modal-actions">
      <button mat-button mat-dialog-close class="small-btn" style="margin-right: 10px;">Đóng</button>
      <button mat-button color="primary" *ngIf="isDetail && !isEdit" (click)="onEdit()" class="small-btn">Sửa</button>
      <button mat-raised-button color="primary" *ngIf="isCreate || (isDetail && isEdit)" type="submit" [disabled]="publisherForm.invalid || isLoading" class="small-btn">
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
export class PublisherDialogComponent {
  publisherForm: FormGroup;
  isEdit = false;
  isLoading = false;
  get isCreate() { return this.data.mode === 'create'; }
  get isDetail() { return this.data.mode === 'detail'; }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<PublisherDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.publisherForm = this.fb.group({
      name: [{ value: data.publisher?.name || '', disabled: this.isDetail && !this.isEdit }, Validators.required],
      address: [{ value: data.publisher?.address || '', disabled: this.isDetail && !this.isEdit }],
      website: [{ value: data.publisher?.website || '', disabled: this.isDetail && !this.isEdit }],
      email: [{ value: data.publisher?.email || '', disabled: this.isDetail && !this.isEdit }],
      phone: [{ value: data.publisher?.phone || '', disabled: this.isDetail && !this.isEdit }],
    });
  }

  onEdit() {
    this.isEdit = true;
    this.publisherForm.get('name')?.enable();
    this.publisherForm.get('address')?.enable();
    this.publisherForm.get('website')?.enable();
    this.publisherForm.get('email')?.enable();
    this.publisherForm.get('phone')?.enable();
  }

  onSubmit() {
    if (this.publisherForm.invalid) return;
    this.isLoading = true;
    const value = this.publisherForm.getRawValue();
    
    if (this.isCreate) {
      this.http.post(`${environment.apiUrl}/api/publisher`, value).subscribe({
        next: () => {
          this.snackBar.open('Tạo nhà xuất bản thành công!', 'Đóng', { duration: 3000 });
          this.isLoading = false;
          this.dialogRef.close('refresh');
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(err.status === 409 ? 'Nhà xuất bản đã tồn tại!' : 'Tạo nhà xuất bản thất bại!', 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
        }
      });
    } else if (this.isDetail && this.isEdit) {
      this.http.put(`${environment.apiUrl}/api/publisher/${this.data.publisher.id}`, value).subscribe({
        next: () => {
          this.snackBar.open('Cập nhật nhà xuất bản thành công!', 'Đóng', { duration: 3000 });
          this.isLoading = false;
          this.dialogRef.close('refresh');
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(err.status === 409 ? 'Nhà xuất bản đã tồn tại!' : 'Cập nhật nhà xuất bản thất bại!', 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }
} 
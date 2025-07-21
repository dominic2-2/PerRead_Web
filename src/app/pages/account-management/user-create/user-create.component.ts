import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { FileUploadService } from 'src/app/services/file-upload.service';

interface UserCreateRequest {
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: string; // "User", "Staff", "Admin"
  isActive: boolean;
  subscriptionPlan?: string; // "Free", "Basic", "Premium"
  subscriptionExpiry?: Date;
  passwordHash: string; // Required for new users
}

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent {
  userForm: FormGroup;
  isLoading = false;

  roles = ['Admin', 'Staff', 'User'];
  subscriptionPlans = ['Free', 'Basic', 'Premium'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private fileUploadService: FileUploadService
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: [''],
      avatarUrl: [''],
      role: ['', Validators.required],
      isActive: [true],
      subscriptionPlan: [''],
      subscriptionExpiry: [null],
      password: ['', Validators.required] // Required for new users
    });
  }

  createUser() {
    if (this.userForm.valid) {
      this.isLoading = true;
      const formValue = this.userForm.value;
      
      const userData: UserCreateRequest = {
        email: formValue.email,
        fullName: formValue.fullName,
        avatarUrl: formValue.avatarUrl || undefined,
        role: formValue.role,
        isActive: formValue.isActive,
        subscriptionPlan: formValue.subscriptionPlan || undefined,
        subscriptionExpiry: formValue.subscriptionExpiry || undefined,
        passwordHash: formValue.password
      };

      this.http.post<UserCreateRequest>(`${environment.apiUrl}/api/user`, userData)
        .subscribe({
          next: (response) => {
            console.log('User created successfully:', response);
            this.isLoading = false;
            this.snackBar.open('Tạo người dùng thành công!', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/accounts']);
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.isLoading = false;
            this.snackBar.open('Tạo người dùng thất bại!', 'Đóng', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  openImageUpload() {
    // Create a temporary input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadImageToAzureBlob(file);
      }
    };
    
    input.click();
  }

  uploadImageToAzureBlob(file: File) {
    // Validate file first
    const validation = this.fileUploadService.validateFile(file, ['image/jpeg', 'image/png', 'image/gif'], 5);
    if (!validation.valid) {
      this.snackBar.open(validation.error || 'File không hợp lệ!', 'Đóng', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    
    this.fileUploadService.uploadAvatar(file).subscribe({
      next: (response) => {
        if (response.success && response.url) {
          this.userForm.patchValue({ avatarUrl: response.url });
          this.snackBar.open('Upload ảnh thành công!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
        } else {
          this.snackBar.open('Upload ảnh thất bại!', 'Đóng', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.snackBar.open('Upload ảnh thất bại!', 'Đóng', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/accounts']);
  }

  private markFormGroupTouched() {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Trường này là bắt buộc';
    }
    if (control?.hasError('email')) {
      return 'Email không hợp lệ';
    }
    return '';
  }
} 
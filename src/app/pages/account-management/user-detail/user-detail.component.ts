import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { FileUploadService } from 'src/app/services/file-upload.service';

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
  passwordHash?: string; // For password updates
}

@Component({
  selector: 'app-user-detail',
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
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule
  ],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  userForm: FormGroup;
  userId: string = '';
  user: User | null = null;
  isLoading = false;
  isEditing = false;

  roles = ['Admin', 'Staff', 'User'];
  subscriptionPlans = ['Free', 'Basic', 'Premium'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private fileUploadService: FileUploadService
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      avatarUrl: [''],
      role: ['', Validators.required],
      isActive: [true],
      subscriptionPlan: [''],
      subscriptionExpiry: [null],
      password: [''] // New password field (optional for updates)
    });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.loadUser();
    }
  }

  loadUser() {
    this.isLoading = true;
    this.http.get<User>(`${environment.apiUrl}/api/user/${this.userId}`)
      .subscribe({
        next: (user) => {
          this.user = user;
          this.populateForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading user:', error);
          this.isLoading = false;
          this.snackBar.open('Không thể tải thông tin người dùng!', 'Đóng', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          this.router.navigate(['/accounts']);
        }
      });
  }

  populateForm() {
    if (this.user) {
      this.userForm.patchValue({
        email: this.user.email,
        fullName: this.user.fullName,
        avatarUrl: this.user.avatarUrl || '',
        role: this.user.role,
        isActive: this.user.isActive,
        subscriptionPlan: this.user.subscriptionPlan || '',
        subscriptionExpiry: this.user.subscriptionExpiry || null,
        password: '' // Always empty for security
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.populateForm(); // Reset form to original values
    }
  }

  saveUser() {
    if (this.userForm.valid) {
      this.isLoading = true;
      const formValue = this.userForm.value;
      
      const userData: any = {
        ...this.user,
        email: formValue.email,
        fullName: formValue.fullName,
        avatarUrl: formValue.avatarUrl,
        role: formValue.role,
        isActive: formValue.isActive,
        subscriptionPlan: formValue.subscriptionPlan,
        subscriptionExpiry: formValue.subscriptionExpiry
      };

      // Only include password if it's provided
      if (formValue.password) {
        userData.passwordHash = formValue.password;
      }

      this.http.put<User>(`${environment.apiUrl}/api/user/${this.userId}`, userData)
        .subscribe({
          next: (updatedUser) => {
            this.user = updatedUser;
            this.isEditing = false;
            this.isLoading = false;
            // Clear password field after successful save
            this.userForm.patchValue({ password: '' });
            this.snackBar.open('Cập nhật người dùng thành công!', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.isLoading = false;
            this.snackBar.open('Cập nhật người dùng thất bại!', 'Đóng', {
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

  cancelEdit() {
    this.isEditing = false;
    this.populateForm();
  }

  goBack() {
    this.router.navigate(['/accounts']);
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

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'default-avatar.png';
    }
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
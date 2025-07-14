import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FileUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private readonly BLOB_BASE_URL = 'https://perread.blob.core.windows.net/uploads';
  private readonly BLOB_SAS_TOKEN = 'sp=racwdl&st=2025-07-12T17:17:17Z&se=2025-08-13T01:17:17Z&sv=2024-11-04&sr=c&sig=Hed2tkS4NIav%2BUc6q4Z9vC5NvqqIYTkWIehOXjdYaBU%3D';

  constructor(private http: HttpClient) {}

  uploadFile(file: File, prefix: string = 'file'): Observable<FileUploadResponse> {
    return new Observable(observer => {
      const uniqueFileName = this.generateUniqueFileName(file.name, prefix);
      
      const fileUrl = `${this.BLOB_BASE_URL}/${uniqueFileName}?${this.BLOB_SAS_TOKEN}`;
      
      // Upload the file
      this.http.put(fileUrl, file, {
        headers: new HttpHeaders({
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type
        })
      }).subscribe({
        next: () => {
          // Return the public URL for the uploaded file
          const publicUrl = `${this.BLOB_BASE_URL}/${uniqueFileName}?${this.BLOB_SAS_TOKEN}`;
          observer.next({
            success: true,
            url: publicUrl,
            fileName: uniqueFileName
          });
          observer.complete();
        },
        error: (error) => {
          console.error('Error uploading to Azure Blob:', error);
          observer.next({
            success: false,
            error: 'Upload failed: ' + error.message
          });
          observer.complete();
        }
      });
    });
  }

  uploadAvatar(file: File): Observable<FileUploadResponse> {
    return this.uploadFile(file, 'avatar');
  }

  uploadDocument(file: File): Observable<FileUploadResponse> {
    return this.uploadFile(file, 'doc');
  }

  uploadImage(file: File): Observable<FileUploadResponse> {
    return this.uploadFile(file, 'img');
  }

  private generateUniqueFileName(originalName: string, prefix: string): string {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${prefix}_${timestamp}_${randomString}.${extension}`;
  }

  // Method to validate file type and size
  validateFile(file: File, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif'], maxSizeMB: number = 5): { valid: boolean; error?: string } {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Loại file không được hỗ trợ. Chỉ chấp nhận: ${allowedTypes.join(', ')}`
      };
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `Kích thước file quá lớn. Tối đa: ${maxSizeMB}MB`
      };
    }

    return { valid: true };
  }
} 
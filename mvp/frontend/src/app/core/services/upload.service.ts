import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  success: boolean;
  url: string;
  publicId: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private apiUrl = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient) {}

  /**
   * Upload logo to Cloudinary via backend API
   * @param base64Image Base64 encoded image string
   * @returns Observable with upload response containing Cloudinary URL
   */
  uploadLogo(base64Image: string): Observable<UploadResponse> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<UploadResponse>(
      `${this.apiUrl}/logo`,
      { image: base64Image },
      { headers }
    );
  }
}

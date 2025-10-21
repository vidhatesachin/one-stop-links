import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Business } from '../../models/types';

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  private apiUrl = `${environment.apiUrl}/businesses`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ businesses: Business[] }> {
    return this.http.get<{ businesses: Business[] }>(this.apiUrl);
  }

  getBySlug(slug: string): Observable<{ business: Business }> {
    return this.http.get<{ business: Business }>(`${this.apiUrl}/slug/${slug}`);
  }

  create(data: Partial<Business>): Observable<{ business: Business }> {
    return this.http.post<{ business: Business }>(this.apiUrl, data);
  }

  update(id: string, data: Partial<Business>): Observable<{ business: Business }> {
    return this.http.patch<{ business: Business }>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}

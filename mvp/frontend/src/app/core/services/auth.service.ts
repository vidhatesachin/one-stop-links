import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../models/types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  handleCallback(token: string): Observable<any> {
    localStorage.setItem('token', token);
    return this.loadUser();
  }

  loadUser(): Observable<{ user: User }> {
    const token = localStorage.getItem('token');
    if (!token) {
      return new Observable(observer => observer.complete());
    }

    return this.http.get<{ user: User }>(`${environment.apiUrl}/auth/me`).pipe(
      tap(response => this.currentUserSubject.next(response.user))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}

import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '@env/environment';
import { ApiEnvelope } from '../models/api.model';
import { User } from '../models/user.model';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_KEY = 'olfatto_access_token';
const REFRESH_TOKEN_KEY = 'olfatto_refresh_token';
const USER_KEY = 'olfatto_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<User | null>(this.readStoredUser());
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  register(payload: { name: string; email: string; password: string }): Observable<User> {
    return this.http.post<ApiEnvelope<AuthResponse>>(`${this.baseUrl}/register`, payload).pipe(
      map((res) => res.data),
      tap((data) => this.setSession(data)),
      map((data) => data.user),
    );
  }

  login(payload: { email: string; password: string }): Observable<User> {
    return this.http.post<ApiEnvelope<AuthResponse>>(`${this.baseUrl}/login`, payload).pipe(
      map((res) => res.data),
      tap((data) => this.setSession(data)),
      map((data) => data.user),
    );
  }

  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/change-password`, payload);
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${this.baseUrl}/logout`, { refreshToken }).subscribe({ error: () => undefined });
    }
    this.clearSession();
    void this.router.navigateByUrl('/auth/login');
  }

  refreshAccessToken(): Observable<{ accessToken: string; refreshToken: string }> {
    return this.http
      .post<
        ApiEnvelope<{ accessToken: string; refreshToken: string }>
      >(`${this.baseUrl}/refresh`, { refreshToken: this.getRefreshToken() })
      .pipe(
        map((res) => res.data),
        tap((tokens) => {
          localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        }),
      );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  // NOTE: tokens are kept in localStorage for MVP simplicity. An httpOnly
  // cookie-based refresh flow is more XSS-resistant and is a reasonable
  // hardening step before a real production launch (see PROGRESS.md).
  private setSession(data: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    this.currentUser.set(data.user);
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  /** Syncs a partial User update (e.g. a new avatar) into the cached session. */
  updateCachedUser(partial: Partial<User>): void {
    const current = this.currentUser();
    if (!current) return;
    const updated = { ...current, ...partial };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    this.currentUser.set(updated);
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }
}

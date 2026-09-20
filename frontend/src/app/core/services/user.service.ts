import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiEnvelope } from '../models/api.model';
import { User, UserProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users/me`;

  getMe(): Observable<User> {
    return this.http.get<ApiEnvelope<User>>(this.baseUrl).pipe(map((res) => res.data));
  }

  updateMe(payload: { name?: string; avatarUrl?: string }): Observable<User> {
    return this.http.patch<ApiEnvelope<User>>(this.baseUrl, payload).pipe(map((res) => res.data));
  }

  getProfile(): Observable<UserProfile> {
    return this.http
      .get<ApiEnvelope<UserProfile>>(`${this.baseUrl}/profile`)
      .pipe(map((res) => res.data));
  }

  updateProfile(payload: Partial<UserProfile>): Observable<UserProfile> {
    return this.http
      .patch<ApiEnvelope<UserProfile>>(`${this.baseUrl}/profile`, payload)
      .pipe(map((res) => res.data));
  }
}

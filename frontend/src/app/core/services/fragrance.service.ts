import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiEnvelope, PaginatedEnvelope } from '../models/api.model';
import {
  Concentration,
  FragranceDetail,
  FragranceFilters,
  FragranceGender,
  FragranceSummary,
} from '../models/fragrance.model';

export interface CreateFragrancePayload {
  name: string;
  brandId: string;
  concentration: Concentration;
  gender: FragranceGender;
  releaseYear?: number;
  description?: string;
  imageUrl?: string;
  noteIds?: string[];
  familyIds?: string[];
}

@Injectable({ providedIn: 'root' })
export class FragranceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/fragrances`;

  list(filters: FragranceFilters): Observable<PaginatedEnvelope<FragranceSummary>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedEnvelope<FragranceSummary>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<FragranceDetail> {
    return this.http
      .get<ApiEnvelope<FragranceDetail>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(payload: CreateFragrancePayload): Observable<{ id: string; name: string }> {
    return this.http
      .post<ApiEnvelope<{ id: string; name: string }>>(this.baseUrl, payload)
      .pipe(map((res) => res.data));
  }
}

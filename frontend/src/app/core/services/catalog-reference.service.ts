import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiEnvelope } from '../models/api.model';

export interface CatalogRef {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogReferenceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  listBrands(): Observable<CatalogRef[]> {
    return this.http
      .get<ApiEnvelope<CatalogRef[]>>(`${this.apiUrl}/brands`)
      .pipe(map((res) => res.data));
  }

  createBrand(name: string): Observable<CatalogRef> {
    return this.http
      .post<ApiEnvelope<CatalogRef>>(`${this.apiUrl}/brands`, { name })
      .pipe(map((res) => res.data));
  }

  listFamilies(): Observable<CatalogRef[]> {
    return this.http
      .get<ApiEnvelope<CatalogRef[]>>(`${this.apiUrl}/families`)
      .pipe(map((res) => res.data));
  }

  listNotes(): Observable<CatalogRef[]> {
    return this.http
      .get<ApiEnvelope<CatalogRef[]>>(`${this.apiUrl}/notes`)
      .pipe(map((res) => res.data));
  }
}

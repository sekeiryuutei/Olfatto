import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PaginatedEnvelope } from '../models/api.model';

export interface RankedFragrance {
  fragranceId: string;
  name: string;
  brandName: string;
  imageUrl: string | null;
  weightedScore: number;
  averageRating: number;
  reviewCount: number;
  averageDurationHours: number;
}

export type RankingTab = 'global' | 'skin' | 'longevity';

@Injectable({ providedIn: 'root' })
export class RankingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/rankings`;

  getRanking(tab: RankingTab, skinType?: string): Observable<PaginatedEnvelope<RankedFragrance>> {
    const params: Record<string, string> = {};
    if (tab === 'skin' && skinType) {
      params['skinType'] = skinType;
    }
    return this.http.get<PaginatedEnvelope<RankedFragrance>>(`${this.baseUrl}/${tab}`, { params });
  }
}

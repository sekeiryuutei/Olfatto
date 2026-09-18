import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiEnvelope, PaginatedEnvelope } from '../models/api.model';
import { CreateReviewPayload, Review } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  listForFragrance(
    fragranceId: string,
    sortBy: 'mostRecent' | 'mostHelpful' | 'longestLasting' = 'mostRecent',
  ): Observable<PaginatedEnvelope<Review>> {
    return this.http.get<PaginatedEnvelope<Review>>(
      `${this.apiUrl}/fragrances/${fragranceId}/reviews`,
      { params: { sortBy } },
    );
  }

  create(fragranceId: string, payload: CreateReviewPayload): Observable<Review> {
    return this.http
      .post<ApiEnvelope<Review>>(`${this.apiUrl}/fragrances/${fragranceId}/reviews`, payload)
      .pipe(map((res) => res.data));
  }

  markHelpful(reviewId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reviews/${reviewId}/helpful`, {});
  }
}

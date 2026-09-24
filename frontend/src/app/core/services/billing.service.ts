import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiEnvelope } from '../models/api.model';

export type SubscriptionStatus = 'NONE' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE';

export interface MySubscription {
  status: SubscriptionStatus;
  isActive: boolean;
  currentPeriodEnd: string | null;
}

export interface RecommendedFragrance {
  fragranceId: string;
  name: string;
  brandName: string;
  imageUrl: string | null;
  compatibilityScore: number;
  averageDurationHours: number | null;
  dominantProjection: string | null;
  matchReasons: string[];
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/billing`;

  getMySubscription(): Observable<MySubscription> {
    return this.http
      .get<ApiEnvelope<MySubscription>>(`${this.baseUrl}/me`)
      .pipe(map((res) => res.data));
  }

  startCheckout(): Observable<{ checkoutUrl: string }> {
    return this.http
      .post<ApiEnvelope<{ checkoutUrl: string }>>(`${this.baseUrl}/checkout-session`, {})
      .pipe(map((res) => res.data));
  }

  openBillingPortal(): Observable<{ portalUrl: string }> {
    return this.http
      .post<ApiEnvelope<{ portalUrl: string }>>(`${this.baseUrl}/portal-session`, {})
      .pipe(map((res) => res.data));
  }

  getAdvancedRecommendations(): Observable<{ data: RecommendedFragrance[] }> {
    return this.http.get<{ data: RecommendedFragrance[] }>(`${environment.apiUrl}/recommendations/advanced`);
  }
}

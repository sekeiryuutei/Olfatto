import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export enum CollectionStatus {
  OWNED = 'OWNED',
  TESTED = 'TESTED',
}

export interface ShelfEntry {
  fragranceId: string;
  addedAt: string;
}

export interface CollectionEntry extends ShelfEntry {
  status: CollectionStatus;
}

export interface RecommendedFragrance {
  fragranceId: string;
  name: string;
  brandName: string;
  imageUrl: string | null;
  compatibilityScore: number;
  averageDurationHours: number | null;
  dominantProjection: string | null;
}

// point 25: Tengo / Probé / Quiero / Favoritos — one service, three "shelves".
@Injectable({ providedIn: 'root' })
export class ShelfService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users/me`;

  // Collection (Tengo / Probé)
  listCollection(): Observable<{ data: CollectionEntry[] }> {
    return this.http.get<{ data: CollectionEntry[] }>(`${this.baseUrl}/collection`);
  }
  addToCollection(fragranceId: string, status: CollectionStatus): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/collection`, { fragranceId, status });
  }
  removeFromCollection(fragranceId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/collection/${fragranceId}`);
  }

  // Wishlist (Quiero)
  listWishlist(): Observable<{ data: ShelfEntry[] }> {
    return this.http.get<{ data: ShelfEntry[] }>(`${this.baseUrl}/wishlist`);
  }
  addToWishlist(fragranceId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/wishlist`, { fragranceId });
  }
  removeFromWishlist(fragranceId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/wishlist/${fragranceId}`);
  }

  // Favorites
  listFavorites(): Observable<{ data: ShelfEntry[] }> {
    return this.http.get<{ data: ShelfEntry[] }>(`${this.baseUrl}/favorites`);
  }
  addFavorite(fragranceId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/favorites`, { fragranceId });
  }
  removeFavorite(fragranceId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/favorites/${fragranceId}`);
  }

  // Recommendations (point 24)
  getRecommendations(): Observable<{ data: RecommendedFragrance[] }> {
    return this.http.get<{ data: RecommendedFragrance[] }>(`${environment.apiUrl}/recommendations`);
  }
}

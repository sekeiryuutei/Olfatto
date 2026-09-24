export enum Concentration {
  EDC = 'EDC',
  EDT = 'EDT',
  EDP = 'EDP',
  PARFUM = 'PARFUM',
  EXTRAIT = 'EXTRAIT',
  OTHER = 'OTHER',
}

export enum FragranceGender {
  MASCULINE = 'MASCULINE',
  FEMININE = 'FEMININE',
  UNISEX = 'UNISEX',
}

export type FragranceSortBy = 'relevance' | 'rating' | 'duration' | 'mostReviewed' | 'mostRecent';

export interface FragranceSummary {
  id: string;
  name: string;
  brandId: string;
  concentration: Concentration;
  gender: FragranceGender;
  imageUrl: string | null;
  averageRating: number | null;
  reviewCount: number;
  averageDurationHours: number | null;
}

export interface DurationBucket {
  label: '<4h' | '4-6h' | '6-8h' | '8-10h' | '10h+';
  count: number;
  percentage: number;
}

export interface SkinPerformanceEntry {
  skinType: string;
  averageDurationHours: number;
  averageRating: number;
  dominantProjection: string;
  reviewCount: number;
}

export interface FragrancePerformance {
  averageRating: number;
  reviewCount: number;
  averageDurationHours: number;
  dominantProjection: string | null;
  durationDistribution: DurationBucket[];
  skinPerformance: SkinPerformanceEntry[];
}

export interface FragranceDetail {
  id: string;
  name: string;
  concentration: Concentration;
  gender: FragranceGender;
  releaseYear: number | null;
  description: string | null;
  imageUrl: string | null;
  affiliateUrl: string | null;
  brand: { id: string; name: string } | null;
  notes: { id: string; name: string }[];
  families: { id: string; name: string }[];
  performance: FragrancePerformance;
}

export interface FragranceFilters {
  search?: string;
  brandId?: string;
  familyId?: string;
  gender?: FragranceGender;
  concentration?: Concentration;
  sortBy?: FragranceSortBy;
  page?: number;
  limit?: number;
}

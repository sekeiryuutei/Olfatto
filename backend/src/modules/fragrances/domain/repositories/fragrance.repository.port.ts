import { Fragrance } from '../entities/fragrance.entity';
import { Concentration } from '../value-objects/concentration.enum';
import { FragranceGender } from '../value-objects/gender.enum';

export const FRAGRANCE_REPOSITORY = Symbol('FRAGRANCE_REPOSITORY');

export interface FragranceFilters {
  search?: string;
  brandId?: string;
  familyId?: string;
  gender?: FragranceGender;
  concentration?: Concentration;
  releaseYearFrom?: number;
  releaseYearTo?: number;
}

export type FragranceSortBy =
  | 'relevance'
  | 'rating'
  | 'duration'
  | 'mostReviewed'
  | 'mostRecent';

export interface FragranceListParams {
  filters: FragranceFilters;
  sortBy: FragranceSortBy;
  page: number;
  limit: number;
}

/** A fragrance plus the lightweight aggregates needed for catalog cards (point 13). */
export interface FragranceListItem {
  fragrance: Fragrance;
  averageRating: number | null;
  reviewCount: number;
  averageDurationHours: number | null;
}

export interface FragranceRepository {
  save(fragrance: Fragrance): Promise<Fragrance>;
  findById(id: string): Promise<Fragrance | null>;
  delete(id: string): Promise<void>;
  list(params: FragranceListParams): Promise<{ items: FragranceListItem[]; total: number }>;
}

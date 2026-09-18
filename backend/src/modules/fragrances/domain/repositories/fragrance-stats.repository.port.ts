import { ProjectionLevel } from '@shared/domain/value-objects/projection-level.enum';
import { SkinType } from '@modules/users/domain/value-objects/profile.enums';

export const FRAGRANCE_STATS_REPOSITORY = Symbol('FRAGRANCE_STATS_REPOSITORY');

export interface FragranceReviewStat {
  rating: number;
  durationHours: number;
  projection: ProjectionLevel;
  skinTypeSnapshot: SkinType;
}

export interface FragranceStatsRepository {
  /** Raw per-review data points for one fragrance — the domain service turns these into distributions/aggregates. */
  getReviewStats(fragranceId: string): Promise<FragranceReviewStat[]>;
  /** Catalog-wide average rating — the "C" constant in the ranking's Bayesian average (point 23). */
  getGlobalAverageRating(): Promise<number>;
}

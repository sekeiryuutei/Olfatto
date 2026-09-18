import { SkinType } from '@modules/users/domain/value-objects/profile.enums';

export const RECOMMENDATION_DATA_REPOSITORY = Symbol('RECOMMENDATION_DATA_REPOSITORY');

export interface FragranceRecommendationData {
  fragranceId: string;
  name: string;
  brandName: string;
  imageUrl: string | null;
  familyIds: string[];
  /** Stats from reviewers who share the target user's skin type. */
  skinAvgRating: number | null;
  skinAvgDurationHours: number | null;
  /** 1 (intimate) .. 4 (enormous) — averaged, not a strict mode. */
  skinAvgProjectionOrdinal: number | null;
  skinReviewCount: number;
  /** Catalog-wide fallback stats, used when there's no same-skin data yet. */
  overallAvgRating: number | null;
  overallAvgDurationHours: number | null;
  overallAvgProjectionOrdinal: number | null;
}

export interface RecommendationDataRepository {
  getCandidates(skinType: SkinType): Promise<FragranceRecommendationData[]>;
}

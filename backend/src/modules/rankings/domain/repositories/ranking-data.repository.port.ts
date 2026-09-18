import { SkinType } from '@modules/users/domain/value-objects/profile.enums';

export const RANKING_DATA_REPOSITORY = Symbol('RANKING_DATA_REPOSITORY');

export interface FragranceRankingData {
  fragranceId: string;
  name: string;
  brandName: string;
  imageUrl: string | null;
  averageRating: number;
  reviewCount: number;
  averageDurationHours: number;
}

export interface RankingDataRepository {
  /** Every fragrance with at least one review, with its aggregate stats. */
  getGlobalAggregates(): Promise<FragranceRankingData[]>;
  /** Same, but aggregated only over reviews whose skin_type_snapshot matches. */
  getSkinFilteredAggregates(skinType: SkinType): Promise<FragranceRankingData[]>;
  getGlobalAverageRating(): Promise<number>;
  getGlobalAverageDuration(): Promise<number>;
}

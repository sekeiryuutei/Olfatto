import { Injectable } from '@nestjs/common';
import { FragranceRankingData } from '../repositories/ranking-data.repository.port';

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

/**
 * Point 23: rankings must separate Rating from Confidence, and avoid a
 * fragrance with a single 5-star review outranking one with hundreds of
 * reviews. This is the classic Bayesian/IMDB-style weighted average:
 *
 *   weighted = (v / (v + m)) * R + (m / (v + m)) * C
 *
 * where R = the fragrance's own average, v = its review count,
 * m = the minimum-observations threshold, C = the catalog-wide average.
 * As v grows past m, the score converges to R; below m, it's pulled
 * toward the catalog average C instead of trusting a small sample.
 */
@Injectable()
export class RankingCalculatorService {
  private readonly DEFAULT_MIN_OBSERVATIONS = 5;

  calculateWeightedScore(
    value: number,
    observationCount: number,
    globalAverage: number,
    minObservations: number = this.DEFAULT_MIN_OBSERVATIONS,
  ): number {
    const v = observationCount;
    const m = minObservations;
    if (v + m === 0) return globalAverage;
    return (v / (v + m)) * value + (m / (v + m)) * globalAverage;
  }

  rankByRating(data: FragranceRankingData[], globalAverageRating: number): RankedFragrance[] {
    return data
      .map((item) => this.toRanked(item, this.calculateWeightedScore(item.averageRating, item.reviewCount, globalAverageRating)))
      .sort((a, b) => b.weightedScore - a.weightedScore);
  }

  rankByLongevity(data: FragranceRankingData[], globalAverageDuration: number): RankedFragrance[] {
    return data
      .map((item) =>
        this.toRanked(
          item,
          this.calculateWeightedScore(item.averageDurationHours, item.reviewCount, globalAverageDuration),
        ),
      )
      .sort((a, b) => b.weightedScore - a.weightedScore);
  }

  private toRanked(item: FragranceRankingData, weightedScore: number): RankedFragrance {
    return {
      fragranceId: item.fragranceId,
      name: item.name,
      brandName: item.brandName,
      imageUrl: item.imageUrl,
      weightedScore: Math.round(weightedScore * 100) / 100,
      averageRating: item.averageRating,
      reviewCount: item.reviewCount,
      averageDurationHours: item.averageDurationHours,
    };
  }
}

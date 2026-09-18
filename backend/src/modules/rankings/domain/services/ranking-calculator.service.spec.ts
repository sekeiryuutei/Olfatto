import { RankingCalculatorService } from './ranking-calculator.service';
import { FragranceRankingData } from '../repositories/ranking-data.repository.port';

function candidate(overrides: Partial<FragranceRankingData>): FragranceRankingData {
  return {
    fragranceId: 'f1',
    name: 'Test Fragrance',
    brandName: 'Test Brand',
    imageUrl: null,
    averageRating: 4,
    reviewCount: 10,
    averageDurationHours: 8,
    ...overrides,
  };
}

describe('RankingCalculatorService', () => {
  const service = new RankingCalculatorService();

  it('pulls a low-review-count fragrance toward the global average (point 23)', () => {
    const globalAverage = 3.5;
    // A single 5-star review should NOT outrank a well-reviewed 4.5-star one.
    const oneReview = service.calculateWeightedScore(5, 1, globalAverage, 5);
    const manyReviews = service.calculateWeightedScore(4.5, 200, globalAverage, 5);

    expect(oneReview).toBeLessThan(manyReviews);
  });

  it('converges toward the raw rating as review count grows relative to the threshold', () => {
    const globalAverage = 3.0;
    const score = service.calculateWeightedScore(4.8, 1000, globalAverage, 5);
    expect(score).toBeCloseTo(4.8, 1);
  });

  it('falls back to the global average when there are zero reviews', () => {
    const score = service.calculateWeightedScore(0, 0, 3.7, 5);
    expect(score).toBeCloseTo(3.7, 5);
  });

  it('rankByRating sorts descending by weighted score', () => {
    const data = [
      candidate({ fragranceId: 'low', averageRating: 3, reviewCount: 50 }),
      candidate({ fragranceId: 'high', averageRating: 4.9, reviewCount: 50 }),
    ];
    const ranked = service.rankByRating(data, 3.5);
    expect(ranked[0].fragranceId).toBe('high');
  });

  it('rankByLongevity uses duration instead of rating as the ranked value', () => {
    const data = [
      candidate({ fragranceId: 'short', averageDurationHours: 3, reviewCount: 50 }),
      candidate({ fragranceId: 'long', averageDurationHours: 11, reviewCount: 50 }),
    ];
    const ranked = service.rankByLongevity(data, 6);
    expect(ranked[0].fragranceId).toBe('long');
  });
});

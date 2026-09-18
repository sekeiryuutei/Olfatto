import { FragrancePerformanceCalculatorService } from './fragrance-performance-calculator.service';
import { ProjectionLevel } from '@shared/domain/value-objects/projection-level.enum';
import { SkinType } from '@modules/users/domain/value-objects/profile.enums';
import { FragranceReviewStat } from '../repositories/fragrance-stats.repository.port';

function stat(overrides: Partial<FragranceReviewStat>): FragranceReviewStat {
  return {
    rating: 4,
    durationHours: 8,
    projection: ProjectionLevel.STRONG,
    skinTypeSnapshot: SkinType.OILY,
    ...overrides,
  };
}

describe('FragrancePerformanceCalculatorService', () => {
  const service = new FragrancePerformanceCalculatorService();

  it('returns an empty summary for a fragrance with no reviews', () => {
    const summary = service.summarize([]);
    expect(summary.reviewCount).toBe(0);
    expect(summary.dominantProjection).toBeNull();
    expect(summary.durationDistribution.every((b) => b.count === 0)).toBe(true);
  });

  it('buckets durations into the point-16 ranges', () => {
    const buckets = service.buildDurationDistribution([2, 5, 5, 7, 9, 11, 11, 11]);
    const byLabel = Object.fromEntries(buckets.map((b) => [b.label, b.count]));
    expect(byLabel['<4h']).toBe(1);
    expect(byLabel['4-6h']).toBe(2);
    expect(byLabel['6-8h']).toBe(1);
    expect(byLabel['8-10h']).toBe(1);
    expect(byLabel['10h+']).toBe(3);
  });

  it('percentages in a distribution sum to ~100', () => {
    const buckets = service.buildDurationDistribution([1, 5, 9, 11]);
    const total = buckets.reduce((sum, b) => sum + b.percentage, 0);
    expect(total).toBeGreaterThanOrEqual(99);
    expect(total).toBeLessThanOrEqual(101);
  });

  it('groups skin performance by skin_type_snapshot (point 17)', () => {
    const stats = [
      stat({ skinTypeSnapshot: SkinType.OILY, durationHours: 9, rating: 5 }),
      stat({ skinTypeSnapshot: SkinType.OILY, durationHours: 9, rating: 5 }),
      stat({ skinTypeSnapshot: SkinType.DRY, durationHours: 5, rating: 3.5 }),
    ];
    const performance = service.buildSkinPerformance(stats);

    const oily = performance.find((p) => p.skinType === SkinType.OILY)!;
    const dry = performance.find((p) => p.skinType === SkinType.DRY)!;

    expect(oily.reviewCount).toBe(2);
    expect(oily.averageDurationHours).toBe(9);
    expect(dry.reviewCount).toBe(1);
    expect(dry.averageRating).toBe(3.5);
    // Most-reviewed skin type first.
    expect(performance[0].skinType).toBe(SkinType.OILY);
  });
});

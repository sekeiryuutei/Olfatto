import { CompatibilityScoreCalculatorService } from './compatibility-score-calculator.service';
import { ProjectionLevel } from '@shared/domain/value-objects/projection-level.enum';
import { PreferredDuration } from '@modules/users/domain/value-objects/profile.enums';
import { FragranceRecommendationData } from '../repositories/recommendation-data.repository.port';

function candidate(overrides: Partial<FragranceRecommendationData>): FragranceRecommendationData {
  return {
    fragranceId: 'f1',
    name: 'Test Fragrance',
    brandName: 'Test Brand',
    imageUrl: null,
    familyIds: [],
    skinAvgRating: 4,
    skinAvgDurationHours: 9,
    skinAvgProjectionOrdinal: 3, // STRONG
    skinReviewCount: 10,
    overallAvgRating: 4,
    overallAvgDurationHours: 9,
    overallAvgProjectionOrdinal: 3,
    ...overrides,
  };
}

describe('CompatibilityScoreCalculatorService', () => {
  const service = new CompatibilityScoreCalculatorService();

  it('scores a fragrance matching every preference higher than one matching none', () => {
    const matching = candidate({ familyIds: ['woody'] });
    const mismatched = candidate({
      familyIds: ['floral'],
      skinAvgDurationHours: 2,
      skinAvgProjectionOrdinal: 1, // INTIMATE
      overallAvgDurationHours: 2,
      overallAvgProjectionOrdinal: 1,
    });

    const profile = {
      preferredFamilyIds: ['woody'],
      preferredDuration: PreferredDuration.LONG, // target ~9h
      preferredProjection: ProjectionLevel.STRONG,
    };

    const matchingScore = service.score(matching, profile).compatibilityScore;
    const mismatchedScore = service.score(mismatched, profile).compatibilityScore;

    expect(matchingScore).toBeGreaterThan(mismatchedScore);
  });

  it('stays neutral (not punitive) when the user has no family preference set', () => {
    const noOverlap = candidate({ familyIds: ['citrus'] });
    const score = service.score(noOverlap, {
      preferredFamilyIds: [],
      preferredDuration: null,
      preferredProjection: null,
    }).compatibilityScore;

    expect(score).toBeGreaterThan(40);
    expect(score).toBeLessThan(80);
  });

  it('falls back to overall stats when there is no same-skin-type data yet', () => {
    const noSkinData = candidate({
      skinReviewCount: 0,
      skinAvgRating: null,
      skinAvgDurationHours: null,
      skinAvgProjectionOrdinal: null,
      overallAvgRating: 4.5,
    });

    const result = service.score(noSkinData, {
      preferredFamilyIds: [],
      preferredDuration: null,
      preferredProjection: null,
    });

    expect(result.averageDurationHours).toBe(9); // overallAvgDurationHours default
  });

  it('rankCandidates sorts by compatibilityScore descending', () => {
    const low = candidate({ fragranceId: 'low', familyIds: ['floral'] });
    const high = candidate({ fragranceId: 'high', familyIds: ['woody'] });

    const ranked = service.rankCandidates([low, high], {
      preferredFamilyIds: ['woody'],
      preferredDuration: null,
      preferredProjection: null,
    });

    expect(ranked[0].fragranceId).toBe('high');
  });
});

import { Injectable } from '@nestjs/common';
import { ProjectionLevel } from '@shared/domain/value-objects/projection-level.enum';
import { PreferredDuration } from '@modules/users/domain/value-objects/profile.enums';
import { FragranceRecommendationData } from '../repositories/recommendation-data.repository.port';

export interface RecommendationProfile {
  preferredFamilyIds: string[];
  preferredDuration: PreferredDuration | null;
  preferredProjection: ProjectionLevel | null;
}

export interface RecommendedFragrance {
  fragranceId: string;
  name: string;
  brandName: string;
  imageUrl: string | null;
  compatibilityScore: number; // 0-100
  averageDurationHours: number | null;
  dominantProjection: ProjectionLevel | null;
}

const PROJECTION_ORDINAL: Record<ProjectionLevel, number> = {
  [ProjectionLevel.INTIMATE]: 1,
  [ProjectionLevel.MODERATE]: 2,
  [ProjectionLevel.STRONG]: 3,
  [ProjectionLevel.ENORMOUS]: 4,
};
const ORDINAL_TO_PROJECTION: ProjectionLevel[] = [
  ProjectionLevel.INTIMATE,
  ProjectionLevel.MODERATE,
  ProjectionLevel.STRONG,
  ProjectionLevel.ENORMOUS,
];

const DURATION_TARGET_HOURS: Record<PreferredDuration, number> = {
  [PreferredDuration.SHORT]: 3,
  [PreferredDuration.MODERATE]: 6,
  [PreferredDuration.LONG]: 9,
  [PreferredDuration.VERY_LONG]: 12,
};

/**
 * Rule-based scoring, intentionally isolated behind this one service
 * (point 24: "El algoritmo debe diseñarse como un servicio independiente
 * para permitir posteriormente implementar Machine Learning") — swapping
 * this for a learned model later means replacing this class, not the
 * use case, the controller, or any entity.
 */
@Injectable()
export class CompatibilityScoreCalculatorService {
  score(data: FragranceRecommendationData, profile: RecommendationProfile): RecommendedFragrance {
    const familyScore = this.familyMatchScore(data.familyIds, profile.preferredFamilyIds);
    const durationScore = this.durationMatchScore(this.effectiveDuration(data), profile.preferredDuration);
    const projectionOrdinal = this.effectiveProjectionOrdinal(data);
    const projectionScore = this.projectionMatchScore(projectionOrdinal, profile.preferredProjection);
    const ratingScore = this.ratingScore(this.effectiveRating(data));

    // Weights sum to 1 — families and duration carry the most signal per
    // point 24's own example ("piel grasa, alta duración, proyección
    // fuerte, amaderados"); rating acts as a quality floor, not the driver.
    const weighted =
      familyScore * 0.35 + durationScore * 0.3 + projectionScore * 0.2 + ratingScore * 0.15;

    return {
      fragranceId: data.fragranceId,
      name: data.name,
      brandName: data.brandName,
      imageUrl: data.imageUrl,
      compatibilityScore: Math.round(weighted * 100),
      averageDurationHours: this.effectiveDuration(data),
      dominantProjection:
        projectionOrdinal != null ? ORDINAL_TO_PROJECTION[Math.round(projectionOrdinal) - 1] : null,
    };
  }

  rankCandidates(
    candidates: FragranceRecommendationData[],
    profile: RecommendationProfile,
  ): RecommendedFragrance[] {
    return candidates
      .map((candidate) => this.score(candidate, profile))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  private effectiveRating(data: FragranceRecommendationData): number | null {
    if (data.skinReviewCount > 0 && data.skinAvgRating != null) return data.skinAvgRating;
    return data.overallAvgRating;
  }

  private effectiveDuration(data: FragranceRecommendationData): number | null {
    if (data.skinReviewCount > 0 && data.skinAvgDurationHours != null) return data.skinAvgDurationHours;
    return data.overallAvgDurationHours;
  }

  private effectiveProjectionOrdinal(data: FragranceRecommendationData): number | null {
    if (data.skinReviewCount > 0 && data.skinAvgProjectionOrdinal != null) {
      return data.skinAvgProjectionOrdinal;
    }
    return data.overallAvgProjectionOrdinal;
  }

  private familyMatchScore(fragranceFamilyIds: string[], preferredFamilyIds: string[]): number {
    if (preferredFamilyIds.length === 0) return 0.6; // no stated preference — stay neutral, not punitive
    const overlaps = fragranceFamilyIds.some((id) => preferredFamilyIds.includes(id));
    return overlaps ? 1 : 0.2;
  }

  private durationMatchScore(actualHours: number | null, preferred: PreferredDuration | null): number {
    if (!preferred || actualHours == null) return 0.6;
    const target = DURATION_TARGET_HOURS[preferred];
    const distanceHours = Math.abs(actualHours - target);
    return Math.max(0.2, 1 - distanceHours / 6);
  }

  private projectionMatchScore(actualOrdinal: number | null, preferred: ProjectionLevel | null): number {
    if (!preferred || actualOrdinal == null) return 0.6;
    const target = PROJECTION_ORDINAL[preferred];
    const distance = Math.abs(actualOrdinal - target);
    if (distance < 0.5) return 1;
    if (distance < 1.5) return 0.6;
    if (distance < 2.5) return 0.3;
    return 0.1;
  }
}

import { Injectable } from '@nestjs/common';
import { ProjectionLevel } from '@shared/domain/value-objects/projection-level.enum';
import { SkinType } from '@modules/users/domain/value-objects/profile.enums';
import { FragranceReviewStat } from '../repositories/fragrance-stats.repository.port';

export type DurationBucketLabel = '<4h' | '4-6h' | '6-8h' | '8-10h' | '10h+';

export interface DurationBucket {
  label: DurationBucketLabel;
  count: number;
  percentage: number;
}

export interface SkinPerformanceEntry {
  skinType: SkinType;
  averageDurationHours: number;
  averageRating: number;
  dominantProjection: ProjectionLevel;
  reviewCount: number;
}

export interface FragrancePerformanceSummary {
  averageRating: number;
  reviewCount: number;
  averageDurationHours: number;
  dominantProjection: ProjectionLevel | null;
  durationDistribution: DurationBucket[];
  skinPerformance: SkinPerformanceEntry[];
}

const BUCKET_LABELS: DurationBucketLabel[] = ['<4h', '4-6h', '6-8h', '8-10h', '10h+'];

@Injectable()
export class FragrancePerformanceCalculatorService {
  summarize(stats: FragranceReviewStat[]): FragrancePerformanceSummary {
    if (stats.length === 0) {
      return {
        averageRating: 0,
        reviewCount: 0,
        averageDurationHours: 0,
        dominantProjection: null,
        durationDistribution: this.emptyDistribution(),
        skinPerformance: [],
      };
    }

    return {
      averageRating: this.round(this.average(stats.map((s) => s.rating)), 1),
      reviewCount: stats.length,
      averageDurationHours: this.round(this.average(stats.map((s) => s.durationHours)), 1),
      dominantProjection: this.mostFrequent(stats.map((s) => s.projection)),
      durationDistribution: this.buildDurationDistribution(stats.map((s) => s.durationHours)),
      skinPerformance: this.buildSkinPerformance(stats),
    };
  }

  /** Point 16: a histogram is far more useful than a single averaged number. */
  buildDurationDistribution(durations: number[]): DurationBucket[] {
    const buckets: Record<DurationBucketLabel, number> = {
      '<4h': 0,
      '4-6h': 0,
      '6-8h': 0,
      '8-10h': 0,
      '10h+': 0,
    };

    for (const hours of durations) {
      if (hours < 4) buckets['<4h']++;
      else if (hours < 6) buckets['4-6h']++;
      else if (hours < 8) buckets['6-8h']++;
      else if (hours < 10) buckets['8-10h']++;
      else buckets['10h+']++;
    }

    const total = durations.length || 1;
    return BUCKET_LABELS.map((label) => ({
      label,
      count: buckets[label],
      percentage: this.round((buckets[label] / total) * 100, 0),
    }));
  }

  /** Point 17: "¿Cómo funciona en diferentes pieles?" — grouped by skin_type_snapshot. */
  buildSkinPerformance(stats: FragranceReviewStat[]): SkinPerformanceEntry[] {
    const bySkin = new Map<SkinType, FragranceReviewStat[]>();
    for (const stat of stats) {
      const bucket = bySkin.get(stat.skinTypeSnapshot) ?? [];
      bucket.push(stat);
      bySkin.set(stat.skinTypeSnapshot, bucket);
    }

    return Array.from(bySkin.entries())
      .map(([skinType, entries]) => ({
        skinType,
        averageDurationHours: this.round(this.average(entries.map((e) => e.durationHours)), 1),
        averageRating: this.round(this.average(entries.map((e) => e.rating)), 1),
        dominantProjection: this.mostFrequent(entries.map((e) => e.projection)) as ProjectionLevel,
        reviewCount: entries.length,
      }))
      .sort((a, b) => b.reviewCount - a.reviewCount);
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private mostFrequent<T>(values: T[]): T | null {
    if (values.length === 0) return null;
    const counts = new Map<T, number>();
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);

    let best = values[0];
    let bestCount = 0;
    for (const [value, count] of counts) {
      if (count > bestCount) {
        best = value;
        bestCount = count;
      }
    }
    return best;
  }

  private round(value: number, decimals: number): number {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }

  private emptyDistribution(): DurationBucket[] {
    return BUCKET_LABELS.map((label) => ({ label, count: 0, percentage: 0 }));
  }
}

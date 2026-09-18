import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SkinType } from '@modules/users/domain/value-objects/profile.enums';
import {
  FragranceRecommendationData,
  RecommendationDataRepository,
} from '../../domain/repositories/recommendation-data.repository.port';

interface RawRow {
  fragrance_id: string;
  name: string;
  brand_name: string;
  image_url: string | null;
  family_ids: string[] | null;
  skin_avg_rating: string | null;
  skin_avg_duration: string | null;
  skin_avg_projection: string | null;
  skin_review_count: string;
  overall_avg_rating: string | null;
  overall_avg_duration: string | null;
  overall_avg_projection: string | null;
}

const num = (v: string | null): number | null => (v != null ? parseFloat(v) : null);

@Injectable()
export class PostgresRecommendationDataRepository implements RecommendationDataRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getCandidates(skinType: SkinType): Promise<FragranceRecommendationData[]> {
    // One pass over fragrances/reviews using FILTER-based conditional
    // aggregation to get both the skin-specific and catalog-wide stats
    // in a single query (see compatibility-score-calculator.service.ts
    // for how "effective" values fall back from one to the other).
    const rows: RawRow[] = await this.dataSource.query(
      `
      SELECT
        f.id AS fragrance_id,
        f.name,
        b.name AS brand_name,
        f.image_url,
        ARRAY_AGG(DISTINCT ff.family_id) FILTER (WHERE ff.family_id IS NOT NULL) AS family_ids,
        AVG(r.rating) FILTER (WHERE r.skin_type_snapshot = $1) AS skin_avg_rating,
        AVG(r.duration_hours) FILTER (WHERE r.skin_type_snapshot = $1) AS skin_avg_duration,
        AVG(
          CASE r.projection
            WHEN 'INTIMATE' THEN 1 WHEN 'MODERATE' THEN 2 WHEN 'STRONG' THEN 3 WHEN 'ENORMOUS' THEN 4
          END
        ) FILTER (WHERE r.skin_type_snapshot = $1) AS skin_avg_projection,
        COUNT(r.id) FILTER (WHERE r.skin_type_snapshot = $1) AS skin_review_count,
        AVG(r.rating) AS overall_avg_rating,
        AVG(r.duration_hours) AS overall_avg_duration,
        AVG(
          CASE r.projection
            WHEN 'INTIMATE' THEN 1 WHEN 'MODERATE' THEN 2 WHEN 'STRONG' THEN 3 WHEN 'ENORMOUS' THEN 4
          END
        ) AS overall_avg_projection
      FROM fragrances f
      JOIN brands b ON b.id = f.brand_id
      LEFT JOIN fragrance_families ff ON ff.fragrance_id = f.id
      LEFT JOIN reviews r ON r.fragrance_id = f.id
      GROUP BY f.id, f.name, b.name, f.image_url
      `,
      [skinType],
    );

    return rows.map((row) => ({
      fragranceId: row.fragrance_id,
      name: row.name,
      brandName: row.brand_name,
      imageUrl: row.image_url,
      familyIds: row.family_ids ?? [],
      skinAvgRating: num(row.skin_avg_rating),
      skinAvgDurationHours: num(row.skin_avg_duration),
      skinAvgProjectionOrdinal: num(row.skin_avg_projection),
      skinReviewCount: parseInt(row.skin_review_count, 10),
      overallAvgRating: num(row.overall_avg_rating),
      overallAvgDurationHours: num(row.overall_avg_duration),
      overallAvgProjectionOrdinal: num(row.overall_avg_projection),
    }));
  }
}

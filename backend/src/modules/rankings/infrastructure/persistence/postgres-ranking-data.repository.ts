import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SkinType } from '@modules/users/domain/value-objects/profile.enums';
import {
  FragranceRankingData,
  RankingDataRepository,
} from '../../domain/repositories/ranking-data.repository.port';

interface RawRow {
  fragrance_id: string;
  name: string;
  brand_name: string;
  image_url: string | null;
  avg_rating: string;
  review_count: string;
  avg_duration: string;
}

function mapRow(row: RawRow): FragranceRankingData {
  return {
    fragranceId: row.fragrance_id,
    name: row.name,
    brandName: row.brand_name,
    imageUrl: row.image_url,
    averageRating: parseFloat(row.avg_rating),
    reviewCount: parseInt(row.review_count, 10),
    averageDurationHours: parseFloat(row.avg_duration),
  };
}

@Injectable()
export class PostgresRankingDataRepository implements RankingDataRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getGlobalAggregates(): Promise<FragranceRankingData[]> {
    const rows: RawRow[] = await this.dataSource.query(`
      SELECT f.id AS fragrance_id, f.name, b.name AS brand_name, f.image_url,
             AVG(r.rating) AS avg_rating, COUNT(r.id) AS review_count, AVG(r.duration_hours) AS avg_duration
      FROM fragrances f
      JOIN brands b ON b.id = f.brand_id
      JOIN reviews r ON r.fragrance_id = f.id
      GROUP BY f.id, f.name, b.name, f.image_url
    `);
    return rows.map(mapRow);
  }

  async getSkinFilteredAggregates(skinType: SkinType): Promise<FragranceRankingData[]> {
    const rows: RawRow[] = await this.dataSource.query(
      `
      SELECT f.id AS fragrance_id, f.name, b.name AS brand_name, f.image_url,
             AVG(r.rating) AS avg_rating, COUNT(r.id) AS review_count, AVG(r.duration_hours) AS avg_duration
      FROM fragrances f
      JOIN brands b ON b.id = f.brand_id
      JOIN reviews r ON r.fragrance_id = f.id AND r.skin_type_snapshot = $1
      GROUP BY f.id, f.name, b.name, f.image_url
      `,
      [skinType],
    );
    return rows.map(mapRow);
  }

  async getGlobalAverageRating(): Promise<number> {
    const [row] = await this.dataSource.query<{ avg: string | null }[]>(
      `SELECT AVG(rating)::float AS avg FROM reviews`,
    );
    return row?.avg != null ? parseFloat(String(row.avg)) : 0;
  }

  async getGlobalAverageDuration(): Promise<number> {
    const [row] = await this.dataSource.query<{ avg: string | null }[]>(
      `SELECT AVG(duration_hours)::float AS avg FROM reviews`,
    );
    return row?.avg != null ? parseFloat(String(row.avg)) : 0;
  }
}

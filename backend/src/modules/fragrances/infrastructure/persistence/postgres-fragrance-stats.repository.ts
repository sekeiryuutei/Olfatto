import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  FragranceReviewStat,
  FragranceStatsRepository,
} from '../../domain/repositories/fragrance-stats.repository.port';

interface RawStatRow {
  rating: string;
  duration_hours: string;
  projection: string;
  skin_type_snapshot: string;
}

@Injectable()
export class PostgresFragranceStatsRepository implements FragranceStatsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getReviewStats(fragranceId: string): Promise<FragranceReviewStat[]> {
    const rows: RawStatRow[] = await this.dataSource.query(
      `SELECT rating, duration_hours, projection, skin_type_snapshot
       FROM reviews
       WHERE fragrance_id = $1`,
      [fragranceId],
    );

    return rows.map((row) => ({
      rating: parseFloat(row.rating),
      durationHours: parseFloat(row.duration_hours),
      projection: row.projection as FragranceReviewStat['projection'],
      skinTypeSnapshot: row.skin_type_snapshot as FragranceReviewStat['skinTypeSnapshot'],
    }));
  }

  async getGlobalAverageRating(): Promise<number> {
    const [row] = await this.dataSource.query<{ avg: string | null }[]>(
      `SELECT AVG(rating)::float AS avg FROM reviews`,
    );
    return row?.avg != null ? parseFloat(String(row.avg)) : 0;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fragrance } from '../../domain/entities/fragrance.entity';
import {
  FragranceListItem,
  FragranceListParams,
  FragranceRepository,
} from '../../domain/repositories/fragrance.repository.port';
import { FragranceOrmEntity } from './fragrance.orm-entity';
import { FragranceMapper } from './fragrance.mapper';

@Injectable()
export class PostgresFragranceRepository implements FragranceRepository {
  constructor(
    @InjectRepository(FragranceOrmEntity)
    private readonly repo: Repository<FragranceOrmEntity>,
  ) {}

  async save(fragrance: Fragrance): Promise<Fragrance> {
    const orm = FragranceMapper.toOrm(fragrance);
    const saved = await this.repo.save(orm);
    const reloaded = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['notes', 'families'],
    });
    return FragranceMapper.toDomain(reloaded as FragranceOrmEntity);
  }

  async findById(id: string): Promise<Fragrance | null> {
    const orm = await this.repo.findOne({ where: { id }, relations: ['notes', 'families'] });
    return orm ? FragranceMapper.toDomain(orm) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  async list(params: FragranceListParams): Promise<{ items: FragranceListItem[]; total: number }> {
    const { filters, sortBy, page, limit } = params;

    // Notes/families are intentionally NOT joined here: the catalog card
    // (point 13) doesn't show them, and a one-to-many join would fan out
    // rows and break COUNT()/pagination. They're only loaded in findById().
    const qb = this.repo.createQueryBuilder('fragrance');

    if (filters.familyId) {
      // Filtering by one specific family id can only ever match a given
      // fragrance once, so this join cannot fan out rows either.
      qb.innerJoin('fragrance.families', 'family', 'family.id = :familyId', {
        familyId: filters.familyId,
      });
    }

    qb.leftJoin(
      (sub) =>
        sub
          .select('review.fragrance_id', 'fragranceId')
          .addSelect('AVG(review.rating)', 'avgRating')
          .addSelect('COUNT(review.id)', 'reviewCount')
          .addSelect('AVG(review.duration_hours)', 'avgDuration')
          .from('reviews', 'review')
          .groupBy('review.fragrance_id'),
      'stats',
      'stats."fragranceId" = fragrance.id',
    )
      .addSelect('stats."avgRating"', 'stats_avgRating')
      .addSelect('stats."reviewCount"', 'stats_reviewCount')
      .addSelect('stats."avgDuration"', 'stats_avgDuration');

    if (filters.search) {
      qb.andWhere('fragrance.name ILIKE :search', { search: `%${filters.search}%` });
    }
    if (filters.brandId) {
      qb.andWhere('fragrance.brand_id = :brandId', { brandId: filters.brandId });
    }
    if (filters.gender) {
      qb.andWhere('fragrance.gender = :gender', { gender: filters.gender });
    }
    if (filters.concentration) {
      qb.andWhere('fragrance.concentration = :concentration', {
        concentration: filters.concentration,
      });
    }
    if (filters.releaseYearFrom != null) {
      qb.andWhere('fragrance.release_year >= :releaseYearFrom', {
        releaseYearFrom: filters.releaseYearFrom,
      });
    }
    if (filters.releaseYearTo != null) {
      qb.andWhere('fragrance.release_year <= :releaseYearTo', {
        releaseYearTo: filters.releaseYearTo,
      });
    }

    // Count BEFORE orderBy/skip/take — a plain COUNT() ignores them anyway
    // and this keeps getCount() from tripping over raw-select aliases.
    const total = await qb.getCount();

    switch (sortBy) {
      case 'rating':
        qb.orderBy('"stats_avgRating"', 'DESC', 'NULLS LAST');
        break;
      case 'duration':
        qb.orderBy('"stats_avgDuration"', 'DESC', 'NULLS LAST');
        break;
      case 'mostReviewed':
        qb.orderBy('"stats_reviewCount"', 'DESC', 'NULLS LAST');
        break;
      case 'mostRecent':
        qb.orderBy('fragrance.created_at', 'DESC');
        break;
      case 'relevance':
      default:
        qb.orderBy('fragrance.name', 'ASC');
        break;
    }

    qb.offset((page - 1) * limit).limit(limit);

    const { entities, raw } = await qb.getRawAndEntities();

    const items: FragranceListItem[] = entities.map((entity, index) => {
      const row = raw[index] as Record<string, string | null>;
      return {
        fragrance: FragranceMapper.toDomain(entity),
        averageRating: row.stats_avgRating != null ? parseFloat(row.stats_avgRating) : null,
        reviewCount: row.stats_reviewCount != null ? parseInt(row.stats_reviewCount, 10) : 0,
        averageDurationHours:
          row.stats_avgDuration != null ? parseFloat(row.stats_avgDuration) : null,
      };
    });

    return { items, total };
  }
}

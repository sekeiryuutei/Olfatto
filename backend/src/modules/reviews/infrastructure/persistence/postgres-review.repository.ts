import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../domain/entities/review.entity';
import {
  ListFragranceReviewsParams,
  ReviewListItem,
  ReviewRepository,
} from '../../domain/repositories/review.repository.port';
import { ReviewOrmEntity } from './review.orm-entity';
import { ReviewMapper } from './review.mapper';

@Injectable()
export class PostgresReviewRepository implements ReviewRepository {
  constructor(
    @InjectRepository(ReviewOrmEntity) private readonly repo: Repository<ReviewOrmEntity>,
  ) {}

  async save(review: Review): Promise<Review> {
    const saved = await this.repo.save(ReviewMapper.toOrm(review));
    return ReviewMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Review | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? ReviewMapper.toDomain(orm) : null;
  }

  async findByUserAndFragrance(userId: string, fragranceId: string): Promise<Review | null> {
    const orm = await this.repo.findOne({ where: { userId, fragranceId } });
    return orm ? ReviewMapper.toDomain(orm) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  async listForFragrance(
    params: ListFragranceReviewsParams,
  ): Promise<{ items: ReviewListItem[]; total: number }> {
    const { fragranceId, sortBy, page, limit } = params;

    const qb = this.repo
      .createQueryBuilder('review')
      .where('review.fragrance_id = :fragranceId', { fragranceId })
      .leftJoin(
        (sub) =>
          sub
            .select('helpful.review_id', 'reviewId')
            .addSelect('COUNT(helpful.id)', 'helpfulCount')
            .from('review_helpful', 'helpful')
            .groupBy('helpful.review_id'),
        'helpful_stats',
        'helpful_stats."reviewId" = review.id',
      )
      .addSelect('COALESCE(helpful_stats."helpfulCount", 0)', 'helpfulCount');

    const total = await qb.getCount();

    switch (sortBy) {
      case 'mostHelpful':
        qb.orderBy('"helpfulCount"', 'DESC').addOrderBy('review.created_at', 'DESC');
        break;
      case 'longestLasting':
        qb.orderBy('review.duration_hours', 'DESC');
        break;
      case 'mostRecent':
      default:
        qb.orderBy('review.created_at', 'DESC');
        break;
    }

    qb.skip((page - 1) * limit).take(limit);

    const { entities, raw } = await qb.getRawAndEntities();

    const items: ReviewListItem[] = entities.map((entity, index) => ({
      review: ReviewMapper.toDomain(entity),
      helpfulCount: parseInt(String(raw[index].helpfulCount ?? 0), 10),
    }));

    return { items, total };
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewHelpfulRepository } from '../../domain/repositories/review-helpful.repository.port';
import { ReviewHelpfulOrmEntity } from './review-helpful.orm-entity';

@Injectable()
export class PostgresReviewHelpfulRepository implements ReviewHelpfulRepository {
  constructor(
    @InjectRepository(ReviewHelpfulOrmEntity)
    private readonly repo: Repository<ReviewHelpfulOrmEntity>,
  ) {}

  async mark(reviewId: string, userId: string): Promise<void> {
    await this.repo.save(this.repo.create({ reviewId, userId }));
  }

  async unmark(reviewId: string, userId: string): Promise<void> {
    await this.repo.delete({ reviewId, userId });
  }

  async hasMarked(reviewId: string, userId: string): Promise<boolean> {
    const count = await this.repo.count({ where: { reviewId, userId } });
    return count > 0;
  }

  async countForReview(reviewId: string): Promise<number> {
    return this.repo.count({ where: { reviewId } });
  }
}

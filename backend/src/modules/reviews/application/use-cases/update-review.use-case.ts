import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { ProjectionLevel } from '@shared/domain/value-objects/projection-level.enum';
import { Review } from '../../domain/entities/review.entity';
import {
  REVIEW_REPOSITORY,
  ReviewRepository,
} from '../../domain/repositories/review.repository.port';
import { ReviewNotFoundException } from '../../domain/exceptions/review-not-found.exception';
import { UnauthorizedReviewActionException } from '../../domain/exceptions/unauthorized-review-action.exception';

export interface UpdateReviewInput {
  reviewId: string;
  requesterId: string;
  rating?: number;
  durationHours?: number;
  projection?: ProjectionLevel;
  liked?: boolean;
  comment?: string | null;
}

@Injectable()
export class UpdateReviewUseCase implements UseCase<UpdateReviewInput, Review> {
  constructor(@Inject(REVIEW_REPOSITORY) private readonly reviewRepository: ReviewRepository) {}

  async execute(input: UpdateReviewInput): Promise<Review> {
    const review = await this.reviewRepository.findById(input.reviewId);
    if (!review) throw new ReviewNotFoundException(input.reviewId);

    if (!review.isOwnedBy(input.requesterId)) {
      throw new UnauthorizedReviewActionException('edit');
    }

    const { reviewId: _reviewId, requesterId: _requesterId, ...updates } = input;
    review.update(updates);

    return this.reviewRepository.save(review);
  }
}

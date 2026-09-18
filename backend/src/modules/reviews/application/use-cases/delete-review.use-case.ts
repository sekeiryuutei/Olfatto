import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  REVIEW_REPOSITORY,
  ReviewRepository,
} from '../../domain/repositories/review.repository.port';
import { ReviewNotFoundException } from '../../domain/exceptions/review-not-found.exception';
import { UnauthorizedReviewActionException } from '../../domain/exceptions/unauthorized-review-action.exception';

export interface DeleteReviewInput {
  reviewId: string;
  requesterId: string;
}

@Injectable()
export class DeleteReviewUseCase implements UseCase<DeleteReviewInput, void> {
  constructor(@Inject(REVIEW_REPOSITORY) private readonly reviewRepository: ReviewRepository) {}

  async execute(input: DeleteReviewInput): Promise<void> {
    const review = await this.reviewRepository.findById(input.reviewId);
    if (!review) throw new ReviewNotFoundException(input.reviewId);

    if (!review.isOwnedBy(input.requesterId)) {
      throw new UnauthorizedReviewActionException('delete');
    }

    await this.reviewRepository.delete(input.reviewId);
  }
}

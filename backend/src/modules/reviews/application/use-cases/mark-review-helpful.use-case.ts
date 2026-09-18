import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  REVIEW_REPOSITORY,
  ReviewRepository,
} from '../../domain/repositories/review.repository.port';
import {
  REVIEW_HELPFUL_REPOSITORY,
  ReviewHelpfulRepository,
} from '../../domain/repositories/review-helpful.repository.port';
import { ReviewNotFoundException } from '../../domain/exceptions/review-not-found.exception';
import { InvalidHelpfulVoteException } from '../../domain/exceptions/invalid-helpful-vote.exception';

export interface MarkReviewHelpfulInput {
  reviewId: string;
  userId: string;
}

@Injectable()
export class MarkReviewHelpfulUseCase implements UseCase<MarkReviewHelpfulInput, void> {
  constructor(
    @Inject(REVIEW_REPOSITORY) private readonly reviewRepository: ReviewRepository,
    @Inject(REVIEW_HELPFUL_REPOSITORY)
    private readonly reviewHelpfulRepository: ReviewHelpfulRepository,
  ) {}

  async execute(input: MarkReviewHelpfulInput): Promise<void> {
    const review = await this.reviewRepository.findById(input.reviewId);
    if (!review) throw new ReviewNotFoundException(input.reviewId);

    if (review.isOwnedBy(input.userId)) {
      throw new InvalidHelpfulVoteException('own_review');
    }

    const alreadyVoted = await this.reviewHelpfulRepository.hasMarked(
      input.reviewId,
      input.userId,
    );
    if (alreadyVoted) {
      throw new InvalidHelpfulVoteException('already_voted');
    }

    await this.reviewHelpfulRepository.mark(input.reviewId, input.userId);
  }
}

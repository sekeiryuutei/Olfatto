import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  REVIEW_HELPFUL_REPOSITORY,
  ReviewHelpfulRepository,
} from '../../domain/repositories/review-helpful.repository.port';

export interface UnmarkReviewHelpfulInput {
  reviewId: string;
  userId: string;
}

@Injectable()
export class UnmarkReviewHelpfulUseCase implements UseCase<UnmarkReviewHelpfulInput, void> {
  constructor(
    @Inject(REVIEW_HELPFUL_REPOSITORY)
    private readonly reviewHelpfulRepository: ReviewHelpfulRepository,
  ) {}

  async execute(input: UnmarkReviewHelpfulInput): Promise<void> {
    // Idempotent — unmarking a vote that doesn't exist is not an error.
    await this.reviewHelpfulRepository.unmark(input.reviewId, input.userId);
  }
}

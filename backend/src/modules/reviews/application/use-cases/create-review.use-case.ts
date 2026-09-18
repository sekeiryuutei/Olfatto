import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '@shared/application/use-case.interface';
import { ProjectionLevel } from '@shared/domain/value-objects/projection-level.enum';
import {
  FRAGRANCE_REPOSITORY,
  FragranceRepository,
} from '@modules/fragrances/domain/repositories/fragrance.repository.port';
import { FragranceNotFoundException } from '@modules/fragrances/domain/exceptions/fragrance-not-found.exception';
import {
  USER_PROFILE_REPOSITORY,
  UserProfileRepository,
} from '@modules/users/domain/repositories/user-profile.repository.port';
import { SkinType } from '@modules/users/domain/value-objects/profile.enums';
import { Review } from '../../domain/entities/review.entity';
import {
  REVIEW_REPOSITORY,
  ReviewRepository,
} from '../../domain/repositories/review.repository.port';
import { DuplicateReviewException } from '../../domain/exceptions/duplicate-review.exception';

export interface CreateReviewInput {
  userId: string;
  fragranceId: string;
  rating: number;
  durationHours: number;
  projection: ProjectionLevel;
  liked: boolean;
  comment?: string | null;
}

@Injectable()
export class CreateReviewUseCase implements UseCase<CreateReviewInput, Review> {
  constructor(
    @Inject(REVIEW_REPOSITORY) private readonly reviewRepository: ReviewRepository,
    @Inject(FRAGRANCE_REPOSITORY) private readonly fragranceRepository: FragranceRepository,
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  async execute(input: CreateReviewInput): Promise<Review> {
    const fragrance = await this.fragranceRepository.findById(input.fragranceId);
    if (!fragrance) throw new FragranceNotFoundException(input.fragranceId);

    const existing = await this.reviewRepository.findByUserAndFragrance(
      input.userId,
      input.fragranceId,
    );
    if (existing) throw new DuplicateReviewException();

    // skin_type_snapshot is captured now and frozen forever (point 34/70) —
    // later profile edits must never retroactively change past stats.
    const profile = await this.userProfileRepository.findByUserId(input.userId);
    const skinTypeSnapshot = profile?.skinType ?? SkinType.UNKNOWN;

    const review = Review.create({
      id: randomUUID(),
      userId: input.userId,
      fragranceId: input.fragranceId,
      rating: input.rating,
      durationHours: input.durationHours,
      projection: input.projection,
      liked: input.liked,
      comment: input.comment,
      skinTypeSnapshot,
    });

    return this.reviewRepository.save(review);
  }
}

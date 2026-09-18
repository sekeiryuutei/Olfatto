import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  USER_PROFILE_REPOSITORY,
  UserProfileRepository,
} from '@modules/users/domain/repositories/user-profile.repository.port';
import { UserNotFoundException } from '@modules/users/domain/exceptions/user-not-found.exception';
import {
  RECOMMENDATION_DATA_REPOSITORY,
  RecommendationDataRepository,
} from '../../domain/repositories/recommendation-data.repository.port';
import {
  CompatibilityScoreCalculatorService,
  RecommendedFragrance,
} from '../../domain/services/compatibility-score-calculator.service';

const DEFAULT_RESULT_COUNT = 10;

@Injectable()
export class GenerateRecommendationsUseCase implements UseCase<string, RecommendedFragrance[]> {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: UserProfileRepository,
    @Inject(RECOMMENDATION_DATA_REPOSITORY)
    private readonly recommendationDataRepository: RecommendationDataRepository,
    private readonly compatibilityCalculator: CompatibilityScoreCalculatorService,
  ) {}

  async execute(userId: string): Promise<RecommendedFragrance[]> {
    const profile = await this.userProfileRepository.findByUserId(userId);
    if (!profile) throw new UserNotFoundException(userId);

    const candidates = await this.recommendationDataRepository.getCandidates(profile.skinType);

    const ranked = this.compatibilityCalculator.rankCandidates(candidates, {
      preferredFamilyIds: profile.preferredFamilyIds,
      preferredDuration: profile.preferredDuration,
      preferredProjection: profile.preferredProjection,
    });

    return ranked.slice(0, DEFAULT_RESULT_COUNT);
  }
}

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

export interface GenerateRecommendationsInput {
  userId: string;
  /** Club's "advanced recommendations" (point: monetización 1) requests more results via the same algorithm. */
  resultCount?: number;
}

@Injectable()
export class GenerateRecommendationsUseCase
  implements UseCase<GenerateRecommendationsInput, RecommendedFragrance[]>
{
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: UserProfileRepository,
    @Inject(RECOMMENDATION_DATA_REPOSITORY)
    private readonly recommendationDataRepository: RecommendationDataRepository,
    private readonly compatibilityCalculator: CompatibilityScoreCalculatorService,
  ) {}

  async execute(input: GenerateRecommendationsInput): Promise<RecommendedFragrance[]> {
    const profile = await this.userProfileRepository.findByUserId(input.userId);
    if (!profile) throw new UserNotFoundException(input.userId);

    const candidates = await this.recommendationDataRepository.getCandidates(profile.skinType);

    const ranked = this.compatibilityCalculator.rankCandidates(candidates, {
      preferredFamilyIds: profile.preferredFamilyIds,
      preferredDuration: profile.preferredDuration,
      preferredProjection: profile.preferredProjection,
    });

    return ranked.slice(0, input.resultCount ?? DEFAULT_RESULT_COUNT);
  }
}

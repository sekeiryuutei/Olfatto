import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { buildPaginationMeta, PaginatedResult } from '@shared/application/pagination';
import { SkinType } from '@modules/users/domain/value-objects/profile.enums';
import {
  RANKING_DATA_REPOSITORY,
  RankingDataRepository,
} from '../../domain/repositories/ranking-data.repository.port';
import { RankedFragrance, RankingCalculatorService } from '../../domain/services/ranking-calculator.service';

export interface GetSkinRankingInput {
  skinType: SkinType;
  page: number;
  limit: number;
}

@Injectable()
export class GetSkinRankingUseCase
  implements UseCase<GetSkinRankingInput, PaginatedResult<RankedFragrance>>
{
  constructor(
    @Inject(RANKING_DATA_REPOSITORY) private readonly rankingDataRepository: RankingDataRepository,
    private readonly rankingCalculator: RankingCalculatorService,
  ) {}

  async execute(input: GetSkinRankingInput): Promise<PaginatedResult<RankedFragrance>> {
    const [data, globalAverage] = await Promise.all([
      this.rankingDataRepository.getSkinFilteredAggregates(input.skinType),
      // The catalog-wide average (not the skin-filtered one) stays the
      // prior — a small skin-specific sample should regress toward the
      // whole catalog's behavior, not toward itself.
      this.rankingDataRepository.getGlobalAverageRating(),
    ]);

    const ranked = this.rankingCalculator.rankByRating(data, globalAverage);
    const start = (input.page - 1) * input.limit;
    const items = ranked.slice(start, start + input.limit);

    return { items, meta: buildPaginationMeta(input.page, input.limit, ranked.length) };
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { buildPaginationMeta, PaginatedResult } from '@shared/application/pagination';
import {
  RANKING_DATA_REPOSITORY,
  RankingDataRepository,
} from '../../domain/repositories/ranking-data.repository.port';
import { RankedFragrance, RankingCalculatorService } from '../../domain/services/ranking-calculator.service';
import { GetRankingInput } from './get-global-ranking.use-case';

@Injectable()
export class GetLongevityRankingUseCase
  implements UseCase<GetRankingInput, PaginatedResult<RankedFragrance>>
{
  constructor(
    @Inject(RANKING_DATA_REPOSITORY) private readonly rankingDataRepository: RankingDataRepository,
    private readonly rankingCalculator: RankingCalculatorService,
  ) {}

  async execute(input: GetRankingInput): Promise<PaginatedResult<RankedFragrance>> {
    const [data, globalAverageDuration] = await Promise.all([
      this.rankingDataRepository.getGlobalAggregates(),
      this.rankingDataRepository.getGlobalAverageDuration(),
    ]);

    const ranked = this.rankingCalculator.rankByLongevity(data, globalAverageDuration);
    const start = (input.page - 1) * input.limit;
    const items = ranked.slice(start, start + input.limit);

    return { items, meta: buildPaginationMeta(input.page, input.limit, ranked.length) };
  }
}

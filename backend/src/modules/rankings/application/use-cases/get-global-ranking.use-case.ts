import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { buildPaginationMeta, PaginatedResult } from '@shared/application/pagination';
import {
  RANKING_DATA_REPOSITORY,
  RankingDataRepository,
} from '../../domain/repositories/ranking-data.repository.port';
import { RankedFragrance, RankingCalculatorService } from '../../domain/services/ranking-calculator.service';

export interface GetRankingInput {
  page: number;
  limit: number;
}

@Injectable()
export class GetGlobalRankingUseCase implements UseCase<GetRankingInput, PaginatedResult<RankedFragrance>> {
  constructor(
    @Inject(RANKING_DATA_REPOSITORY) private readonly rankingDataRepository: RankingDataRepository,
    private readonly rankingCalculator: RankingCalculatorService,
  ) {}

  async execute(input: GetRankingInput): Promise<PaginatedResult<RankedFragrance>> {
    const [data, globalAverage] = await Promise.all([
      this.rankingDataRepository.getGlobalAggregates(),
      this.rankingDataRepository.getGlobalAverageRating(),
    ]);

    const ranked = this.rankingCalculator.rankByRating(data, globalAverage);
    const start = (input.page - 1) * input.limit;
    const items = ranked.slice(start, start + input.limit);

    return { items, meta: buildPaginationMeta(input.page, input.limit, ranked.length) };
  }
}

import { Module } from '@nestjs/common';
import { PostgresRankingDataRepository } from './infrastructure/persistence/postgres-ranking-data.repository';
import { RANKING_DATA_REPOSITORY } from './domain/repositories/ranking-data.repository.port';
import { RankingCalculatorService } from './domain/services/ranking-calculator.service';
import { RankingsController } from './infrastructure/http/rankings.controller';
import { GetGlobalRankingUseCase } from './application/use-cases/get-global-ranking.use-case';
import { GetSkinRankingUseCase } from './application/use-cases/get-skin-ranking.use-case';
import { GetLongevityRankingUseCase } from './application/use-cases/get-longevity-ranking.use-case';

@Module({
  controllers: [RankingsController],
  providers: [
    { provide: RANKING_DATA_REPOSITORY, useClass: PostgresRankingDataRepository },
    RankingCalculatorService,
    GetGlobalRankingUseCase,
    GetSkinRankingUseCase,
    GetLongevityRankingUseCase,
  ],
})
export class RankingsModule {}

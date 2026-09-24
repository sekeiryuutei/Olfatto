import { Module } from '@nestjs/common';
import { UsersModule } from '@modules/users/users.module';
import { BillingModule } from '@modules/billing/billing.module';
import { PostgresRecommendationDataRepository } from './infrastructure/persistence/postgres-recommendation-data.repository';
import { RECOMMENDATION_DATA_REPOSITORY } from './domain/repositories/recommendation-data.repository.port';
import { CompatibilityScoreCalculatorService } from './domain/services/compatibility-score-calculator.service';
import { RecommendationsController } from './infrastructure/http/recommendations.controller';
import { GenerateRecommendationsUseCase } from './application/use-cases/generate-recommendations.use-case';

@Module({
  imports: [UsersModule, BillingModule],
  controllers: [RecommendationsController],
  providers: [
    { provide: RECOMMENDATION_DATA_REPOSITORY, useClass: PostgresRecommendationDataRepository },
    CompatibilityScoreCalculatorService,
    GenerateRecommendationsUseCase,
  ],
})
export class RecommendationsModule {}

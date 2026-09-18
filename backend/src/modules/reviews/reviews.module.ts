import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FragrancesModule } from '@modules/fragrances/fragrances.module';
import { UsersModule } from '@modules/users/users.module';
import { ReviewOrmEntity } from './infrastructure/persistence/review.orm-entity';
import { ReviewHelpfulOrmEntity } from './infrastructure/persistence/review-helpful.orm-entity';
import { PostgresReviewRepository } from './infrastructure/persistence/postgres-review.repository';
import { PostgresReviewHelpfulRepository } from './infrastructure/persistence/postgres-review-helpful.repository';
import { REVIEW_REPOSITORY } from './domain/repositories/review.repository.port';
import { REVIEW_HELPFUL_REPOSITORY } from './domain/repositories/review-helpful.repository.port';
import { ReviewsController } from './infrastructure/http/reviews.controller';
import { CreateReviewUseCase } from './application/use-cases/create-review.use-case';
import { UpdateReviewUseCase } from './application/use-cases/update-review.use-case';
import { DeleteReviewUseCase } from './application/use-cases/delete-review.use-case';
import { ListFragranceReviewsUseCase } from './application/use-cases/list-fragrance-reviews.use-case';
import { MarkReviewHelpfulUseCase } from './application/use-cases/mark-review-helpful.use-case';
import { UnmarkReviewHelpfulUseCase } from './application/use-cases/unmark-review-helpful.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewOrmEntity, ReviewHelpfulOrmEntity]),
    FragrancesModule,
    UsersModule,
  ],
  controllers: [ReviewsController],
  providers: [
    { provide: REVIEW_REPOSITORY, useClass: PostgresReviewRepository },
    { provide: REVIEW_HELPFUL_REPOSITORY, useClass: PostgresReviewHelpfulRepository },
    CreateReviewUseCase,
    UpdateReviewUseCase,
    DeleteReviewUseCase,
    ListFragranceReviewsUseCase,
    MarkReviewHelpfulUseCase,
    UnmarkReviewHelpfulUseCase,
  ],
})
export class ReviewsModule {}

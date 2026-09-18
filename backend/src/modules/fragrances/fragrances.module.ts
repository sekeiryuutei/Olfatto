import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FragranceOrmEntity } from './infrastructure/persistence/fragrance.orm-entity';
import { BrandOrmEntity } from './infrastructure/persistence/brand.orm-entity';
import { NoteOrmEntity } from './infrastructure/persistence/note.orm-entity';
import { FamilyOrmEntity } from './infrastructure/persistence/family.orm-entity';
import { PostgresFragranceRepository } from './infrastructure/persistence/postgres-fragrance.repository';
import { PostgresBrandRepository } from './infrastructure/persistence/postgres-brand.repository';
import { PostgresNoteRepository } from './infrastructure/persistence/postgres-note.repository';
import { PostgresFamilyRepository } from './infrastructure/persistence/postgres-family.repository';
import { PostgresFragranceStatsRepository } from './infrastructure/persistence/postgres-fragrance-stats.repository';
import { FRAGRANCE_REPOSITORY } from './domain/repositories/fragrance.repository.port';
import { BRAND_REPOSITORY } from './domain/repositories/brand.repository.port';
import { NOTE_REPOSITORY } from './domain/repositories/note.repository.port';
import { FAMILY_REPOSITORY } from './domain/repositories/family.repository.port';
import { FRAGRANCE_STATS_REPOSITORY } from './domain/repositories/fragrance-stats.repository.port';
import { FragrancePerformanceCalculatorService } from './domain/services/fragrance-performance-calculator.service';
import { FragrancesController } from './infrastructure/http/fragrances.controller';
import { CreateFragranceUseCase } from './application/use-cases/create-fragrance.use-case';
import { UpdateFragranceUseCase } from './application/use-cases/update-fragrance.use-case';
import { DeleteFragranceUseCase } from './application/use-cases/delete-fragrance.use-case';
import { GetFragranceDetailsUseCase } from './application/use-cases/get-fragrance-details.use-case';
import { ListFragrancesUseCase } from './application/use-cases/list-fragrances.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([FragranceOrmEntity, BrandOrmEntity, NoteOrmEntity, FamilyOrmEntity]),
  ],
  controllers: [FragrancesController],
  providers: [
    { provide: FRAGRANCE_REPOSITORY, useClass: PostgresFragranceRepository },
    { provide: BRAND_REPOSITORY, useClass: PostgresBrandRepository },
    { provide: NOTE_REPOSITORY, useClass: PostgresNoteRepository },
    { provide: FAMILY_REPOSITORY, useClass: PostgresFamilyRepository },
    { provide: FRAGRANCE_STATS_REPOSITORY, useClass: PostgresFragranceStatsRepository },
    FragrancePerformanceCalculatorService,
    CreateFragranceUseCase,
    UpdateFragranceUseCase,
    DeleteFragranceUseCase,
    GetFragranceDetailsUseCase,
    ListFragrancesUseCase,
  ],
  // Exported so the Reviews module (and, later, Rankings/Recommendations)
  // can validate a fragranceId exists without duplicating queries.
  exports: [FRAGRANCE_REPOSITORY, FRAGRANCE_STATS_REPOSITORY],
})
export class FragrancesModule {}

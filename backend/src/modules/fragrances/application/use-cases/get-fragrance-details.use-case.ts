import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { Fragrance } from '../../domain/entities/fragrance.entity';
import { Brand } from '../../domain/entities/brand.entity';
import { Note } from '../../domain/entities/note.entity';
import { Family } from '../../domain/entities/family.entity';
import {
  FRAGRANCE_REPOSITORY,
  FragranceRepository,
} from '../../domain/repositories/fragrance.repository.port';
import { BRAND_REPOSITORY, BrandRepository } from '../../domain/repositories/brand.repository.port';
import { NOTE_REPOSITORY, NoteRepository } from '../../domain/repositories/note.repository.port';
import {
  FAMILY_REPOSITORY,
  FamilyRepository,
} from '../../domain/repositories/family.repository.port';
import {
  FRAGRANCE_STATS_REPOSITORY,
  FragranceStatsRepository,
} from '../../domain/repositories/fragrance-stats.repository.port';
import {
  FragrancePerformanceCalculatorService,
  FragrancePerformanceSummary,
} from '../../domain/services/fragrance-performance-calculator.service';
import { FragranceNotFoundException } from '../../domain/exceptions/fragrance-not-found.exception';

export interface FragranceDetails {
  fragrance: Fragrance;
  brand: Brand | null;
  notes: Note[];
  families: Family[];
  performance: FragrancePerformanceSummary;
}

@Injectable()
export class GetFragranceDetailsUseCase implements UseCase<string, FragranceDetails> {
  constructor(
    @Inject(FRAGRANCE_REPOSITORY) private readonly fragranceRepository: FragranceRepository,
    @Inject(BRAND_REPOSITORY) private readonly brandRepository: BrandRepository,
    @Inject(NOTE_REPOSITORY) private readonly noteRepository: NoteRepository,
    @Inject(FAMILY_REPOSITORY) private readonly familyRepository: FamilyRepository,
    @Inject(FRAGRANCE_STATS_REPOSITORY)
    private readonly statsRepository: FragranceStatsRepository,
    private readonly performanceCalculator: FragrancePerformanceCalculatorService,
  ) {}

  async execute(id: string): Promise<FragranceDetails> {
    const fragrance = await this.fragranceRepository.findById(id);
    if (!fragrance) throw new FragranceNotFoundException(id);

    const [brand, notes, families, stats] = await Promise.all([
      this.brandRepository.findById(fragrance.brandId),
      this.noteRepository.findByIds(fragrance.noteIds),
      this.familyRepository.findByIds(fragrance.familyIds),
      this.statsRepository.getReviewStats(id),
    ]);

    return {
      fragrance,
      brand,
      notes,
      families,
      performance: this.performanceCalculator.summarize(stats),
    };
  }
}

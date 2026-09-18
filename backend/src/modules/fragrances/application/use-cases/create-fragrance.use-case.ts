import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '@shared/application/use-case.interface';
import { Fragrance } from '../../domain/entities/fragrance.entity';
import {
  FRAGRANCE_REPOSITORY,
  FragranceRepository,
} from '../../domain/repositories/fragrance.repository.port';
import { Concentration } from '../../domain/value-objects/concentration.enum';
import { FragranceGender } from '../../domain/value-objects/gender.enum';

export interface CreateFragranceInput {
  brandId: string;
  name: string;
  concentration: Concentration;
  gender: FragranceGender;
  releaseYear?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  noteIds?: string[];
  familyIds?: string[];
}

@Injectable()
export class CreateFragranceUseCase implements UseCase<CreateFragranceInput, Fragrance> {
  constructor(
    @Inject(FRAGRANCE_REPOSITORY) private readonly fragranceRepository: FragranceRepository,
  ) {}

  async execute(input: CreateFragranceInput): Promise<Fragrance> {
    const fragrance = Fragrance.create({ id: randomUUID(), ...input });
    return this.fragranceRepository.save(fragrance);
  }
}

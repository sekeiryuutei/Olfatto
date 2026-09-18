import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { Fragrance } from '../../domain/entities/fragrance.entity';
import {
  FRAGRANCE_REPOSITORY,
  FragranceRepository,
} from '../../domain/repositories/fragrance.repository.port';
import { FragranceNotFoundException } from '../../domain/exceptions/fragrance-not-found.exception';
import { Concentration } from '../../domain/value-objects/concentration.enum';
import { FragranceGender } from '../../domain/value-objects/gender.enum';

export interface UpdateFragranceInput {
  id: string;
  name?: string;
  concentration?: Concentration;
  gender?: FragranceGender;
  releaseYear?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  noteIds?: string[];
  familyIds?: string[];
}

@Injectable()
export class UpdateFragranceUseCase implements UseCase<UpdateFragranceInput, Fragrance> {
  constructor(
    @Inject(FRAGRANCE_REPOSITORY) private readonly fragranceRepository: FragranceRepository,
  ) {}

  async execute(input: UpdateFragranceInput): Promise<Fragrance> {
    const fragrance = await this.fragranceRepository.findById(input.id);
    if (!fragrance) throw new FragranceNotFoundException(input.id);

    const { id: _id, ...updates } = input;
    fragrance.update(updates);

    return this.fragranceRepository.save(fragrance);
  }
}

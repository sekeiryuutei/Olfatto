import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  FRAGRANCE_REPOSITORY,
  FragranceRepository,
} from '../../domain/repositories/fragrance.repository.port';
import { FragranceNotFoundException } from '../../domain/exceptions/fragrance-not-found.exception';

@Injectable()
export class DeleteFragranceUseCase implements UseCase<string, void> {
  constructor(
    @Inject(FRAGRANCE_REPOSITORY) private readonly fragranceRepository: FragranceRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const fragrance = await this.fragranceRepository.findById(id);
    if (!fragrance) throw new FragranceNotFoundException(id);
    await this.fragranceRepository.delete(id);
  }
}

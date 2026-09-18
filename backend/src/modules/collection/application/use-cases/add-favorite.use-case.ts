import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  FRAGRANCE_REPOSITORY,
  FragranceRepository,
} from '@modules/fragrances/domain/repositories/fragrance.repository.port';
import { FragranceNotFoundException } from '@modules/fragrances/domain/exceptions/fragrance-not-found.exception';
import {
  FAVORITE_REPOSITORY,
  FavoriteRepository,
} from '../../domain/repositories/favorite.repository.port';

export interface FavoriteActionInput {
  userId: string;
  fragranceId: string;
}

@Injectable()
export class AddFavoriteUseCase implements UseCase<FavoriteActionInput, void> {
  constructor(
    @Inject(FAVORITE_REPOSITORY) private readonly favoriteRepository: FavoriteRepository,
    @Inject(FRAGRANCE_REPOSITORY) private readonly fragranceRepository: FragranceRepository,
  ) {}

  async execute(input: FavoriteActionInput): Promise<void> {
    const fragrance = await this.fragranceRepository.findById(input.fragranceId);
    if (!fragrance) throw new FragranceNotFoundException(input.fragranceId);
    await this.favoriteRepository.add(input.userId, input.fragranceId);
  }
}

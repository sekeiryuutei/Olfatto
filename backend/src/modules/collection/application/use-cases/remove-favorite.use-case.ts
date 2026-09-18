import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  FAVORITE_REPOSITORY,
  FavoriteRepository,
} from '../../domain/repositories/favorite.repository.port';
import { FavoriteActionInput } from './add-favorite.use-case';

@Injectable()
export class RemoveFavoriteUseCase implements UseCase<FavoriteActionInput, void> {
  constructor(
    @Inject(FAVORITE_REPOSITORY) private readonly favoriteRepository: FavoriteRepository,
  ) {}

  async execute(input: FavoriteActionInput): Promise<void> {
    await this.favoriteRepository.remove(input.userId, input.fragranceId);
  }
}

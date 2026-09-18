import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  FAVORITE_REPOSITORY,
  FavoriteEntry,
  FavoriteRepository,
} from '../../domain/repositories/favorite.repository.port';

@Injectable()
export class ListFavoritesUseCase implements UseCase<string, FavoriteEntry[]> {
  constructor(
    @Inject(FAVORITE_REPOSITORY) private readonly favoriteRepository: FavoriteRepository,
  ) {}

  execute(userId: string): Promise<FavoriteEntry[]> {
    return this.favoriteRepository.listForUser(userId);
  }
}

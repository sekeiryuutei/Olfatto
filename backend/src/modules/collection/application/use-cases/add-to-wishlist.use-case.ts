import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  FRAGRANCE_REPOSITORY,
  FragranceRepository,
} from '@modules/fragrances/domain/repositories/fragrance.repository.port';
import { FragranceNotFoundException } from '@modules/fragrances/domain/exceptions/fragrance-not-found.exception';
import {
  WISHLIST_REPOSITORY,
  WishlistRepository,
} from '../../domain/repositories/wishlist.repository.port';

export interface WishlistActionInput {
  userId: string;
  fragranceId: string;
}

@Injectable()
export class AddToWishlistUseCase implements UseCase<WishlistActionInput, void> {
  constructor(
    @Inject(WISHLIST_REPOSITORY) private readonly wishlistRepository: WishlistRepository,
    @Inject(FRAGRANCE_REPOSITORY) private readonly fragranceRepository: FragranceRepository,
  ) {}

  async execute(input: WishlistActionInput): Promise<void> {
    const fragrance = await this.fragranceRepository.findById(input.fragranceId);
    if (!fragrance) throw new FragranceNotFoundException(input.fragranceId);
    await this.wishlistRepository.add(input.userId, input.fragranceId);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  WISHLIST_REPOSITORY,
  WishlistRepository,
} from '../../domain/repositories/wishlist.repository.port';
import { WishlistActionInput } from './add-to-wishlist.use-case';

@Injectable()
export class RemoveFromWishlistUseCase implements UseCase<WishlistActionInput, void> {
  constructor(
    @Inject(WISHLIST_REPOSITORY) private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(input: WishlistActionInput): Promise<void> {
    await this.wishlistRepository.remove(input.userId, input.fragranceId);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  WISHLIST_REPOSITORY,
  WishlistEntry,
  WishlistRepository,
} from '../../domain/repositories/wishlist.repository.port';

@Injectable()
export class ListWishlistUseCase implements UseCase<string, WishlistEntry[]> {
  constructor(
    @Inject(WISHLIST_REPOSITORY) private readonly wishlistRepository: WishlistRepository,
  ) {}

  execute(userId: string): Promise<WishlistEntry[]> {
    return this.wishlistRepository.listForUser(userId);
  }
}

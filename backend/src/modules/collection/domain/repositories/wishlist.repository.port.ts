export const WISHLIST_REPOSITORY = Symbol('WISHLIST_REPOSITORY');

export interface WishlistEntry {
  fragranceId: string;
  addedAt: Date;
}

export interface WishlistRepository {
  add(userId: string, fragranceId: string): Promise<void>;
  remove(userId: string, fragranceId: string): Promise<void>;
  listForUser(userId: string): Promise<WishlistEntry[]>;
}

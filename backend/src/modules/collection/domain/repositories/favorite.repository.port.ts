export const FAVORITE_REPOSITORY = Symbol('FAVORITE_REPOSITORY');

export interface FavoriteEntry {
  fragranceId: string;
  addedAt: Date;
}

export interface FavoriteRepository {
  add(userId: string, fragranceId: string): Promise<void>;
  remove(userId: string, fragranceId: string): Promise<void>;
  listForUser(userId: string): Promise<FavoriteEntry[]>;
}

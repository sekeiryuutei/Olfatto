export enum CollectionStatus {
  OWNED = 'OWNED',
  TESTED = 'TESTED',
}

export const COLLECTION_REPOSITORY = Symbol('COLLECTION_REPOSITORY');

export interface CollectionEntry {
  fragranceId: string;
  status: CollectionStatus;
  addedAt: Date;
}

export interface CollectionRepository {
  upsert(userId: string, fragranceId: string, status: CollectionStatus): Promise<void>;
  remove(userId: string, fragranceId: string): Promise<void>;
  listForUser(userId: string): Promise<CollectionEntry[]>;
}

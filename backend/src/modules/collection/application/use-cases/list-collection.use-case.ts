import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  COLLECTION_REPOSITORY,
  CollectionEntry,
  CollectionRepository,
} from '../../domain/repositories/collection.repository.port';

@Injectable()
export class ListCollectionUseCase implements UseCase<string, CollectionEntry[]> {
  constructor(
    @Inject(COLLECTION_REPOSITORY) private readonly collectionRepository: CollectionRepository,
  ) {}

  execute(userId: string): Promise<CollectionEntry[]> {
    return this.collectionRepository.listForUser(userId);
  }
}

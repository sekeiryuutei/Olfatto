import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  COLLECTION_REPOSITORY,
  CollectionRepository,
} from '../../domain/repositories/collection.repository.port';

export interface RemoveFromCollectionInput {
  userId: string;
  fragranceId: string;
}

@Injectable()
export class RemoveFromCollectionUseCase implements UseCase<RemoveFromCollectionInput, void> {
  constructor(
    @Inject(COLLECTION_REPOSITORY) private readonly collectionRepository: CollectionRepository,
  ) {}

  async execute(input: RemoveFromCollectionInput): Promise<void> {
    await this.collectionRepository.remove(input.userId, input.fragranceId);
  }
}

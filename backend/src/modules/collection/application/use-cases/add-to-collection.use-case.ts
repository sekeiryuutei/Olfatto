import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  FRAGRANCE_REPOSITORY,
  FragranceRepository,
} from '@modules/fragrances/domain/repositories/fragrance.repository.port';
import { FragranceNotFoundException } from '@modules/fragrances/domain/exceptions/fragrance-not-found.exception';
import {
  COLLECTION_REPOSITORY,
  CollectionRepository,
  CollectionStatus,
} from '../../domain/repositories/collection.repository.port';

export interface AddToCollectionInput {
  userId: string;
  fragranceId: string;
  status: CollectionStatus;
}

@Injectable()
export class AddToCollectionUseCase implements UseCase<AddToCollectionInput, void> {
  constructor(
    @Inject(COLLECTION_REPOSITORY) private readonly collectionRepository: CollectionRepository,
    @Inject(FRAGRANCE_REPOSITORY) private readonly fragranceRepository: FragranceRepository,
  ) {}

  async execute(input: AddToCollectionInput): Promise<void> {
    const fragrance = await this.fragranceRepository.findById(input.fragranceId);
    if (!fragrance) throw new FragranceNotFoundException(input.fragranceId);
    await this.collectionRepository.upsert(input.userId, input.fragranceId, input.status);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { Family } from '../../domain/entities/family.entity';
import { FAMILY_REPOSITORY, FamilyRepository } from '../../domain/repositories/family.repository.port';

@Injectable()
export class ListFamiliesUseCase implements UseCase<void, Family[]> {
  constructor(@Inject(FAMILY_REPOSITORY) private readonly familyRepository: FamilyRepository) {}

  execute(): Promise<Family[]> {
    return this.familyRepository.findAll();
  }
}

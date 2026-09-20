import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { Brand } from '../../domain/entities/brand.entity';
import { BRAND_REPOSITORY, BrandRepository } from '../../domain/repositories/brand.repository.port';

@Injectable()
export class ListBrandsUseCase implements UseCase<void, Brand[]> {
  constructor(@Inject(BRAND_REPOSITORY) private readonly brandRepository: BrandRepository) {}

  execute(): Promise<Brand[]> {
    return this.brandRepository.findAll();
  }
}

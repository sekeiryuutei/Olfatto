import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '@shared/application/use-case.interface';
import { Brand } from '../../domain/entities/brand.entity';
import { BRAND_REPOSITORY, BrandRepository } from '../../domain/repositories/brand.repository.port';

export interface CreateBrandInput {
  name: string;
  logoUrl?: string | null;
}

// Open to any authenticated user, same spirit as fragrance creation
// (point 5) — a new fragrance often needs a brand that doesn't exist yet.
@Injectable()
export class CreateBrandUseCase implements UseCase<CreateBrandInput, Brand> {
  constructor(@Inject(BRAND_REPOSITORY) private readonly brandRepository: BrandRepository) {}

  async execute(input: CreateBrandInput): Promise<Brand> {
    const existing = await this.brandRepository.findAll();
    const match = existing.find((b) => b.name.toLowerCase() === input.name.trim().toLowerCase());
    if (match) return match; // idempotent — avoid duplicate brands from a race or a re-submit

    const brand = Brand.create({ id: randomUUID(), name: input.name, logoUrl: input.logoUrl });
    return this.brandRepository.save(brand);
  }
}

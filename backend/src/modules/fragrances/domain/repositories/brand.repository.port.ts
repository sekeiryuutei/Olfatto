import { Brand } from '../entities/brand.entity';

export const BRAND_REPOSITORY = Symbol('BRAND_REPOSITORY');

export interface BrandRepository {
  save(brand: Brand): Promise<Brand>;
  findById(id: string): Promise<Brand | null>;
  findAll(): Promise<Brand[]>;
}

import { Family } from '../entities/family.entity';

export const FAMILY_REPOSITORY = Symbol('FAMILY_REPOSITORY');

export interface FamilyRepository {
  save(family: Family): Promise<Family>;
  findAll(): Promise<Family[]>;
  findByIds(ids: string[]): Promise<Family[]>;
}

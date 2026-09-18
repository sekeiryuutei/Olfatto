import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Family } from '../../domain/entities/family.entity';
import { FamilyRepository } from '../../domain/repositories/family.repository.port';
import { FamilyOrmEntity } from './family.orm-entity';
import { FamilyMapper } from './family.mapper';

@Injectable()
export class PostgresFamilyRepository implements FamilyRepository {
  constructor(
    @InjectRepository(FamilyOrmEntity) private readonly repo: Repository<FamilyOrmEntity>,
  ) {}

  async save(family: Family): Promise<Family> {
    const saved = await this.repo.save(FamilyMapper.toOrm(family));
    return FamilyMapper.toDomain(saved);
  }

  async findAll(): Promise<Family[]> {
    const orms = await this.repo.find({ order: { name: 'ASC' } });
    return orms.map(FamilyMapper.toDomain);
  }

  async findByIds(ids: string[]): Promise<Family[]> {
    if (ids.length === 0) return [];
    const orms = await this.repo.find({ where: { id: In(ids) } });
    return orms.map(FamilyMapper.toDomain);
  }
}

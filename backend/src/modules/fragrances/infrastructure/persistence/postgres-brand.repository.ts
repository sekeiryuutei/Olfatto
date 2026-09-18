import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../../domain/entities/brand.entity';
import { BrandRepository } from '../../domain/repositories/brand.repository.port';
import { BrandOrmEntity } from './brand.orm-entity';
import { BrandMapper } from './brand.mapper';

@Injectable()
export class PostgresBrandRepository implements BrandRepository {
  constructor(
    @InjectRepository(BrandOrmEntity) private readonly repo: Repository<BrandOrmEntity>,
  ) {}

  async save(brand: Brand): Promise<Brand> {
    const saved = await this.repo.save(BrandMapper.toOrm(brand));
    return BrandMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Brand | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? BrandMapper.toDomain(orm) : null;
  }

  async findAll(): Promise<Brand[]> {
    const orms = await this.repo.find({ order: { name: 'ASC' } });
    return orms.map(BrandMapper.toDomain);
  }
}

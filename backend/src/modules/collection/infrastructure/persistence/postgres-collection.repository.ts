import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CollectionEntry,
  CollectionRepository,
  CollectionStatus,
} from '../../domain/repositories/collection.repository.port';
import { CollectionItemOrmEntity } from './collection-item.orm-entity';

@Injectable()
export class PostgresCollectionRepository implements CollectionRepository {
  constructor(
    @InjectRepository(CollectionItemOrmEntity)
    private readonly repo: Repository<CollectionItemOrmEntity>,
  ) {}

  async upsert(userId: string, fragranceId: string, status: CollectionStatus): Promise<void> {
    const existing = await this.repo.findOne({ where: { userId, fragranceId } });
    if (existing) {
      existing.status = status;
      await this.repo.save(existing);
      return;
    }
    await this.repo.save(this.repo.create({ userId, fragranceId, status }));
  }

  async remove(userId: string, fragranceId: string): Promise<void> {
    await this.repo.delete({ userId, fragranceId });
  }

  async listForUser(userId: string): Promise<CollectionEntry[]> {
    const rows = await this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    return rows.map((r) => ({
      fragranceId: r.fragranceId,
      status: r.status as CollectionStatus,
      addedAt: r.createdAt,
    }));
  }
}

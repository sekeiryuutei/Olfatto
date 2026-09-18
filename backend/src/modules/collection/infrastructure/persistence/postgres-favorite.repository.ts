import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FavoriteEntry,
  FavoriteRepository,
} from '../../domain/repositories/favorite.repository.port';
import { FavoriteOrmEntity } from './favorite.orm-entity';

@Injectable()
export class PostgresFavoriteRepository implements FavoriteRepository {
  constructor(
    @InjectRepository(FavoriteOrmEntity)
    private readonly repo: Repository<FavoriteOrmEntity>,
  ) {}

  async add(userId: string, fragranceId: string): Promise<void> {
    const exists = await this.repo.findOne({ where: { userId, fragranceId } });
    if (exists) return;
    await this.repo.save(this.repo.create({ userId, fragranceId }));
  }

  async remove(userId: string, fragranceId: string): Promise<void> {
    await this.repo.delete({ userId, fragranceId });
  }

  async listForUser(userId: string): Promise<FavoriteEntry[]> {
    const rows = await this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    return rows.map((r) => ({ fragranceId: r.fragranceId, addedAt: r.createdAt }));
  }
}

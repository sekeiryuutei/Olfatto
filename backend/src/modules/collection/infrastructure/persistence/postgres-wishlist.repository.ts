import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WishlistEntry,
  WishlistRepository,
} from '../../domain/repositories/wishlist.repository.port';
import { WishlistItemOrmEntity } from './wishlist-item.orm-entity';

@Injectable()
export class PostgresWishlistRepository implements WishlistRepository {
  constructor(
    @InjectRepository(WishlistItemOrmEntity)
    private readonly repo: Repository<WishlistItemOrmEntity>,
  ) {}

  async add(userId: string, fragranceId: string): Promise<void> {
    const exists = await this.repo.findOne({ where: { userId, fragranceId } });
    if (exists) return; // idempotent
    await this.repo.save(this.repo.create({ userId, fragranceId }));
  }

  async remove(userId: string, fragranceId: string): Promise<void> {
    await this.repo.delete({ userId, fragranceId });
  }

  async listForUser(userId: string): Promise<WishlistEntry[]> {
    const rows = await this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    return rows.map((r) => ({ fragranceId: r.fragranceId, addedAt: r.createdAt }));
  }
}

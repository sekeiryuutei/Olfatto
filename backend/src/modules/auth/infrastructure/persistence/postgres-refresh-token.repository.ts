import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import {
  RefreshTokenRecord,
  RefreshTokenRepository,
} from '../../domain/ports/refresh-token.repository.port';
import { RefreshTokenOrmEntity } from './refresh-token.orm-entity';

@Injectable()
export class PostgresRefreshTokenRepository implements RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly repo: Repository<RefreshTokenOrmEntity>,
  ) {}

  async save(
    record: Omit<RefreshTokenRecord, 'id' | 'createdAt'>,
  ): Promise<RefreshTokenRecord> {
    const saved = await this.repo.save(this.repo.create(record));
    return saved;
  }

  async findValidByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const record = await this.repo.findOne({
      where: { tokenHash, revoked: false, expiresAt: MoreThan(new Date()) },
    });
    return record ?? null;
  }

  async revoke(id: string): Promise<void> {
    await this.repo.update({ id }, { revoked: true });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.repo.update({ userId, revoked: false }, { revoked: true });
  }
}

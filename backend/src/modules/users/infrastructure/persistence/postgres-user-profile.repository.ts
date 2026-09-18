import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import { UserProfileRepository } from '../../domain/repositories/user-profile.repository.port';
import { UserProfileOrmEntity } from './user-profile.orm-entity';
import { UserProfileMapper } from './user-profile.mapper';

@Injectable()
export class PostgresUserProfileRepository implements UserProfileRepository {
  constructor(
    @InjectRepository(UserProfileOrmEntity)
    private readonly repo: Repository<UserProfileOrmEntity>,
  ) {}

  async save(profile: UserProfile): Promise<UserProfile> {
    const orm = UserProfileMapper.toOrm(profile);
    const saved = await this.repo.save(orm);
    return UserProfileMapper.toDomain(saved);
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const orm = await this.repo.findOne({ where: { userId } });
    return orm ? UserProfileMapper.toDomain(orm) : null;
  }
}

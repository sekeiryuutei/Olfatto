import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository.port';
import { UserOrmEntity } from './user.orm-entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class PostgresUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const orm = UserMapper.toOrm(user);
    const saved = await this.repo.save(orm);
    return UserMapper.toDomain(saved);
  }

  async findById(id: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { email: email.toLowerCase() } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repo.count({ where: { email: email.toLowerCase() } });
    return count > 0;
  }
}

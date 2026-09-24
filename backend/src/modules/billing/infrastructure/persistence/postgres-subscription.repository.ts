import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../../domain/entities/subscription.entity';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository.port';
import { SubscriptionOrmEntity } from './subscription.orm-entity';
import { SubscriptionMapper } from './subscription.mapper';

@Injectable()
export class PostgresSubscriptionRepository implements SubscriptionRepository {
  constructor(
    @InjectRepository(SubscriptionOrmEntity)
    private readonly repo: Repository<SubscriptionOrmEntity>,
  ) {}

  async save(subscription: Subscription): Promise<Subscription> {
    const saved = await this.repo.save(SubscriptionMapper.toOrm(subscription));
    return SubscriptionMapper.toDomain(saved);
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    const orm = await this.repo.findOne({ where: { userId } });
    return orm ? SubscriptionMapper.toDomain(orm) : null;
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null> {
    const orm = await this.repo.findOne({ where: { stripeCustomerId } });
    return orm ? SubscriptionMapper.toDomain(orm) : null;
  }
}

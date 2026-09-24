import { Subscription } from '../../domain/entities/subscription.entity';
import { SubscriptionStatus } from '../../domain/entities/subscription.entity';
import { SubscriptionOrmEntity } from './subscription.orm-entity';

export class SubscriptionMapper {
  static toDomain(orm: SubscriptionOrmEntity): Subscription {
    return Subscription.reconstitute(orm.id, {
      userId: orm.userId,
      stripeCustomerId: orm.stripeCustomerId,
      stripeSubscriptionId: orm.stripeSubscriptionId,
      status: orm.status as SubscriptionStatus,
      currentPeriodEnd: orm.currentPeriodEnd,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: Subscription): SubscriptionOrmEntity {
    const snapshot = domain.toSnapshot();
    const orm = new SubscriptionOrmEntity();
    orm.id = domain.id;
    orm.userId = snapshot.userId;
    orm.stripeCustomerId = snapshot.stripeCustomerId;
    orm.stripeSubscriptionId = snapshot.stripeSubscriptionId;
    orm.status = snapshot.status;
    orm.currentPeriodEnd = snapshot.currentPeriodEnd;
    orm.createdAt = snapshot.createdAt;
    orm.updatedAt = snapshot.updatedAt;
    return orm;
  }
}

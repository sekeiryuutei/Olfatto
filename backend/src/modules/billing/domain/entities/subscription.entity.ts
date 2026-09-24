import { BaseEntity } from '@shared/domain/base.entity';

export enum SubscriptionStatus {
  NONE = 'NONE', // no Stripe subscription exists yet
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  INCOMPLETE = 'INCOMPLETE',
}

export interface SubscriptionProps {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Subscription extends BaseEntity<SubscriptionProps> {
  private constructor(id: string, props: SubscriptionProps) {
    super(id, props);
  }

  static create(params: { id: string; userId: string; stripeCustomerId: string }): Subscription {
    const now = new Date();
    return new Subscription(params.id, {
      userId: params.userId,
      stripeCustomerId: params.stripeCustomerId,
      stripeSubscriptionId: null,
      status: SubscriptionStatus.NONE,
      currentPeriodEnd: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(id: string, props: SubscriptionProps): Subscription {
    return new Subscription(id, props);
  }

  get userId(): string {
    return this.props.userId;
  }
  get stripeCustomerId(): string {
    return this.props.stripeCustomerId;
  }
  get stripeSubscriptionId(): string | null {
    return this.props.stripeSubscriptionId;
  }
  get status(): SubscriptionStatus {
    return this.props.status;
  }
  get currentPeriodEnd(): Date | null {
    return this.props.currentPeriodEnd;
  }

  get isActive(): boolean {
    return this.props.status === SubscriptionStatus.ACTIVE;
  }

  /** Applied whenever a Stripe webhook reports a subscription change. */
  syncFromStripe(params: {
    stripeSubscriptionId: string | null;
    status: SubscriptionStatus;
    currentPeriodEnd: Date | null;
  }): void {
    this.props.stripeSubscriptionId = params.stripeSubscriptionId;
    this.props.status = params.status;
    this.props.currentPeriodEnd = params.currentPeriodEnd;
    this.props.updatedAt = new Date();
  }

  toSnapshot(): SubscriptionProps {
    return { ...this.props };
  }
}

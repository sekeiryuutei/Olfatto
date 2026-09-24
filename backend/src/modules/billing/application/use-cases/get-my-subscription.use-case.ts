import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { SubscriptionStatus } from '../../domain/entities/subscription.entity';
import {
  SUBSCRIPTION_REPOSITORY,
  SubscriptionRepository,
} from '../../domain/repositories/subscription.repository.port';

export interface MySubscriptionResult {
  status: SubscriptionStatus;
  isActive: boolean;
  currentPeriodEnd: Date | null;
}

@Injectable()
export class GetMySubscriptionUseCase implements UseCase<string, MySubscriptionResult> {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(userId: string): Promise<MySubscriptionResult> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    if (!subscription) {
      return { status: SubscriptionStatus.NONE, isActive: false, currentPeriodEnd: null };
    }
    return {
      status: subscription.status,
      isActive: subscription.isActive,
      currentPeriodEnd: subscription.currentPeriodEnd,
    };
  }
}

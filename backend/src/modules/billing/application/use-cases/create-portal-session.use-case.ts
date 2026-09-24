import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UseCase } from '@shared/application/use-case.interface';
import { AppConfig } from '@config/configuration';
import {
  SUBSCRIPTION_REPOSITORY,
  SubscriptionRepository,
} from '../../domain/repositories/subscription.repository.port';
import { STRIPE_GATEWAY, StripeGateway } from '../../domain/ports/stripe-gateway.port';
import { SubscriptionNotFoundException } from '../../domain/exceptions/subscription-not-found.exception';

@Injectable()
export class CreatePortalSessionUseCase implements UseCase<string, { portalUrl: string }> {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(STRIPE_GATEWAY) private readonly stripeGateway: StripeGateway,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async execute(userId: string): Promise<{ portalUrl: string }> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    // No Stripe customer yet means they've never even started a checkout —
    // nothing to manage.
    if (!subscription) throw new SubscriptionNotFoundException();

    const stripeConfig = this.configService.get('stripe', { infer: true });
    const session = await this.stripeGateway.createPortalSession({
      customerId: subscription.stripeCustomerId,
      returnUrl: stripeConfig.portalReturnUrl,
    });

    return { portalUrl: session.url };
  }
}

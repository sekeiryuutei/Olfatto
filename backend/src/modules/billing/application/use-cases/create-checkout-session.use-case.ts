import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { UseCase } from '@shared/application/use-case.interface';
import { AppConfig } from '@config/configuration';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/users/domain/repositories/user.repository.port';
import { UserNotFoundException } from '@modules/users/domain/exceptions/user-not-found.exception';
import { Subscription } from '../../domain/entities/subscription.entity';
import {
  SUBSCRIPTION_REPOSITORY,
  SubscriptionRepository,
} from '../../domain/repositories/subscription.repository.port';
import { STRIPE_GATEWAY, StripeGateway } from '../../domain/ports/stripe-gateway.port';

@Injectable()
export class CreateCheckoutSessionUseCase implements UseCase<string, { checkoutUrl: string }> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(STRIPE_GATEWAY) private readonly stripeGateway: StripeGateway,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async execute(userId: string): Promise<{ checkoutUrl: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundException(userId);

    let subscription = await this.subscriptionRepository.findByUserId(userId);

    if (!subscription) {
      // First time this user touches billing — create the Stripe Customer
      // once and keep it forever, even across cancel/resubscribe cycles.
      const stripeCustomerId = await this.stripeGateway.createCustomer(user.email, user.name);
      subscription = Subscription.create({ id: randomUUID(), userId, stripeCustomerId });
      subscription = await this.subscriptionRepository.save(subscription);
    }

    const stripeConfig = this.configService.get('stripe', { infer: true });

    const session = await this.stripeGateway.createCheckoutSession({
      customerId: subscription.stripeCustomerId,
      priceId: stripeConfig.clubPriceId,
      successUrl: stripeConfig.successUrl,
      cancelUrl: stripeConfig.cancelUrl,
    });

    return { checkoutUrl: session.url };
  }
}

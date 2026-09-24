import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UseCase } from '@shared/application/use-case.interface';
import { AppConfig } from '@config/configuration';
import { SubscriptionStatus } from '../../domain/entities/subscription.entity';
import {
  SUBSCRIPTION_REPOSITORY,
  SubscriptionRepository,
} from '../../domain/repositories/subscription.repository.port';
import { STRIPE_GATEWAY, StripeGateway } from '../../domain/ports/stripe-gateway.port';

export interface HandleStripeWebhookInput {
  rawBody: Buffer;
  signature: string;
}

const STRIPE_TO_DOMAIN_STATUS: Record<string, SubscriptionStatus> = {
  active: SubscriptionStatus.ACTIVE,
  trialing: SubscriptionStatus.ACTIVE,
  past_due: SubscriptionStatus.PAST_DUE,
  unpaid: SubscriptionStatus.PAST_DUE,
  canceled: SubscriptionStatus.CANCELED,
  incomplete: SubscriptionStatus.INCOMPLETE,
  incomplete_expired: SubscriptionStatus.CANCELED,
};

// This is the ONLY place in the app that trusts an unauthenticated POST —
// legitimate because StripeGateway.constructWebhookEvent verifies the
// request was actually signed by Stripe using the webhook secret, which is
// exactly as strong a guarantee as a JWT, just via a different mechanism.
@Injectable()
export class HandleStripeWebhookUseCase implements UseCase<HandleStripeWebhookInput, void> {
  private readonly logger = new Logger('StripeWebhook');

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(STRIPE_GATEWAY) private readonly stripeGateway: StripeGateway,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async execute(input: HandleStripeWebhookInput): Promise<void> {
    const webhookSecret = this.configService.get('stripe', { infer: true }).webhookSecret;
    const event = this.stripeGateway.constructWebhookEvent(
      input.rawBody,
      input.signature,
      webhookSecret,
    );

    const snapshot = this.stripeGateway.extractSubscriptionSnapshot(event);
    if (!snapshot) return; // an event type we don't care about — not an error

    const subscription = await this.subscriptionRepository.findByStripeCustomerId(
      snapshot.customerId,
    );
    if (!subscription) {
      // Shouldn't normally happen (the Customer is always created by us
      // first) but never crash a webhook over a data mismatch — log and move on.
      this.logger.warn(`Webhook for unknown Stripe customer ${snapshot.customerId}`);
      return;
    }

    subscription.syncFromStripe({
      stripeSubscriptionId: snapshot.stripeSubscriptionId,
      status: STRIPE_TO_DOMAIN_STATUS[snapshot.status] ?? SubscriptionStatus.INCOMPLETE,
      currentPeriodEnd: snapshot.currentPeriodEnd,
    });
    await this.subscriptionRepository.save(subscription);
  }
}

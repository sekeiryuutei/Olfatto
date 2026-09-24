import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@config/configuration';
import {
  StripeCheckoutSession,
  StripeGateway,
  StripePortalSession,
  StripeSubscriptionSnapshot,
} from '../../domain/ports/stripe-gateway.port';

@Injectable()
export class StripeSdkGateway implements StripeGateway {
  private readonly client: Stripe;

  constructor(configService: ConfigService<AppConfig, true>) {
    const secretKey = configService.get('stripe', { infer: true }).secretKey;
    // Constructed even with an empty key so the app still boots without
    // Stripe configured — every call below will simply fail loudly with a
    // clear Stripe SDK error the first time billing is actually used,
    // rather than crashing the whole API at startup.
    this.client = new Stripe(secretKey || 'sk_test_placeholder', { apiVersion: '2024-06-20' });
  }

  async createCustomer(email: string, name: string): Promise<string> {
    const customer = await this.client.customers.create({ email, name });
    return customer.id;
  }

  async createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<StripeCheckoutSession> {
    const session = await this.client.checkout.sessions.create({
      customer: params.customerId,
      mode: 'subscription',
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });
    if (!session.url) throw new Error('Stripe did not return a checkout URL.');
    return { url: session.url };
  }

  async createPortalSession(params: {
    customerId: string;
    returnUrl: string;
  }): Promise<StripePortalSession> {
    const session = await this.client.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });
    return { url: session.url };
  }

  constructWebhookEvent(rawBody: Buffer, signature: string, webhookSecret: string): Stripe.Event {
    // Throws Stripe.errors.StripeSignatureVerificationError on a bad/missing
    // signature — the controller lets that propagate as a 400, which is
    // exactly right: an unverifiable webhook must be rejected, not trusted.
    return this.client.webhooks.constructEvent(rawBody, signature, webhookSecret);
  }

  extractSubscriptionSnapshot(event: unknown): StripeSubscriptionSnapshot | null {
    const stripeEvent = event as Stripe.Event;

    const RELEVANT_TYPES = [
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
    ];
    if (!RELEVANT_TYPES.includes(stripeEvent.type)) return null;

    const subscription = stripeEvent.data.object as Stripe.Subscription;
    const currentPeriodEndSeconds = subscription.items.data[0]?.current_period_end;

    return {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: currentPeriodEndSeconds
        ? new Date(currentPeriodEndSeconds * 1000)
        : new Date(),
      customerId:
        typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
    };
  }
}

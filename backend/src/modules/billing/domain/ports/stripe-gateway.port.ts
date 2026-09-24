export const STRIPE_GATEWAY = Symbol('STRIPE_GATEWAY');

export interface StripeCheckoutSession {
  url: string;
}

export interface StripePortalSession {
  url: string;
}

export interface StripeSubscriptionSnapshot {
  stripeSubscriptionId: string;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
  currentPeriodEnd: Date;
  customerId: string;
}

/**
 * Isolates the Stripe SDK behind a port — domain/application code never
 * imports 'stripe' directly, matching the same pattern as every other
 * external dependency in this codebase (point 91: swap the implementation
 * without touching the rules that use it — e.g. for MercadoPago later).
 */
export interface StripeGateway {
  createCustomer(email: string, name: string): Promise<string>;
  createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<StripeCheckoutSession>;
  createPortalSession(params: { customerId: string; returnUrl: string }): Promise<StripePortalSession>;
  constructWebhookEvent(rawBody: Buffer, signature: string, webhookSecret: string): unknown;
  extractSubscriptionSnapshot(event: unknown): StripeSubscriptionSnapshot | null;
}

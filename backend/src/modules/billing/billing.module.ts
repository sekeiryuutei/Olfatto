import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@modules/users/users.module';
import { SubscriptionOrmEntity } from './infrastructure/persistence/subscription.orm-entity';
import { PostgresSubscriptionRepository } from './infrastructure/persistence/postgres-subscription.repository';
import { SUBSCRIPTION_REPOSITORY } from './domain/repositories/subscription.repository.port';
import { STRIPE_GATEWAY } from './domain/ports/stripe-gateway.port';
import { StripeSdkGateway } from './infrastructure/stripe/stripe-sdk.gateway';
import { ClubGuard } from './infrastructure/security/club.guard';
import { BillingController } from './infrastructure/http/billing.controller';
import { CreateCheckoutSessionUseCase } from './application/use-cases/create-checkout-session.use-case';
import { CreatePortalSessionUseCase } from './application/use-cases/create-portal-session.use-case';
import { GetMySubscriptionUseCase } from './application/use-cases/get-my-subscription.use-case';
import { HandleStripeWebhookUseCase } from './application/use-cases/handle-stripe-webhook.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionOrmEntity]), UsersModule],
  controllers: [BillingController],
  providers: [
    { provide: SUBSCRIPTION_REPOSITORY, useClass: PostgresSubscriptionRepository },
    { provide: STRIPE_GATEWAY, useClass: StripeSdkGateway },
    ClubGuard,
    CreateCheckoutSessionUseCase,
    CreatePortalSessionUseCase,
    GetMySubscriptionUseCase,
    HandleStripeWebhookUseCase,
  ],
  // Exported so other modules (Recommendations, Fragrances) can gate their
  // own Club-exclusive endpoints with the same guard/repository.
  exports: [SUBSCRIPTION_REPOSITORY, ClubGuard],
})
export class BillingModule {}

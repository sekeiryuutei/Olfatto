import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@modules/auth/infrastructure/security/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/infrastructure/security/current-user.decorator';
import { CreateCheckoutSessionUseCase } from '../../application/use-cases/create-checkout-session.use-case';
import { CreatePortalSessionUseCase } from '../../application/use-cases/create-portal-session.use-case';
import { GetMySubscriptionUseCase } from '../../application/use-cases/get-my-subscription.use-case';
import { HandleStripeWebhookUseCase } from '../../application/use-cases/handle-stripe-webhook.use-case';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
    private readonly createPortalSessionUseCase: CreatePortalSessionUseCase,
    private readonly getMySubscriptionUseCase: GetMySubscriptionUseCase,
    private readonly handleStripeWebhookUseCase: HandleStripeWebhookUseCase,
  ) {}

  @Get('me')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  getMySubscription(@CurrentUser('sub') userId: string) {
    return this.getMySubscriptionUseCase.execute(userId);
  }

  @Post('checkout-session')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  createCheckoutSession(@CurrentUser('sub') userId: string) {
    return this.createCheckoutSessionUseCase.execute(userId);
  }

  @Post('portal-session')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  createPortalSession(@CurrentUser('sub') userId: string) {
    return this.createPortalSessionUseCase.execute(userId);
  }

  // Intentionally unauthenticated (no JwtAuthGuard) — Stripe calls this, not
  // a logged-in browser. Trust comes from the signature check inside the
  // use case instead (see handle-stripe-webhook.use-case.ts).
  @Post('webhook')
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: true }> {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw request body for Stripe signature verification.');
    }
    if (!signature) {
      throw new BadRequestException('Missing Stripe-Signature header.');
    }
    await this.handleStripeWebhookUseCase.execute({ rawBody: req.rawBody, signature });
    return { received: true };
  }
}

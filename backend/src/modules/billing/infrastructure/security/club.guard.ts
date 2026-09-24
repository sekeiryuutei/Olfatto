import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AccessTokenPayload } from '@modules/auth/domain/ports/token-service.port';
import {
  SUBSCRIPTION_REPOSITORY,
  SubscriptionRepository,
} from '../../domain/repositories/subscription.repository.port';
import { ClubRequiredException } from '../../domain/exceptions/club-required.exception';

// Use alongside JwtAuthGuard (needs req.user already populated):
//   @UseGuards(JwtAuthGuard, ClubGuard)
@Injectable()
export class ClubGuard implements CanActivate {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AccessTokenPayload | undefined;
    if (!user) return false;

    const subscription = await this.subscriptionRepository.findByUserId(user.sub);
    if (!subscription?.isActive) {
      throw new ClubRequiredException();
    }
    return true;
  }
}

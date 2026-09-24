import { NotFoundDomainException } from '@shared/domain/domain.exception';

export class SubscriptionNotFoundException extends NotFoundDomainException {
  readonly code = 'SUBSCRIPTION_NOT_FOUND';

  constructor() {
    super('No billing record found for this user yet — start a checkout first.');
  }
}

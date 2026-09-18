import { UnauthorizedDomainException } from '@shared/domain/domain.exception';

export class UnauthorizedReviewActionException extends UnauthorizedDomainException {
  readonly code = 'UNAUTHORIZED_ACTION';

  constructor(action: 'edit' | 'delete' = 'edit') {
    super(`You can only ${action} your own reviews.`);
  }
}

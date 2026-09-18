import { InvalidInputDomainException } from '@shared/domain/domain.exception';

export class InvalidReviewException extends InvalidInputDomainException {
  readonly code = 'INVALID_REVIEW';

  constructor(reason: string) {
    super(`Review data is invalid: ${reason}`);
  }
}

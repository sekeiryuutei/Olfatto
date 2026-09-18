import { ConflictDomainException } from '@shared/domain/domain.exception';

export class DuplicateReviewException extends ConflictDomainException {
  readonly code = 'DUPLICATE_REVIEW';

  constructor() {
    super('You already reviewed this fragrance — edit your existing review instead.');
  }
}

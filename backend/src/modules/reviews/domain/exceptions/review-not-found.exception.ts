import { NotFoundDomainException } from '@shared/domain/domain.exception';

export class ReviewNotFoundException extends NotFoundDomainException {
  readonly code = 'REVIEW_NOT_FOUND';

  constructor(id: string) {
    super(`Review "${id}" was not found.`);
  }
}

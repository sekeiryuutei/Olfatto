import { NotFoundDomainException } from '@shared/domain/domain.exception';

export class UserNotFoundException extends NotFoundDomainException {
  readonly code = 'USER_NOT_FOUND';

  constructor(identifier: string) {
    super(`User "${identifier}" was not found.`);
  }
}

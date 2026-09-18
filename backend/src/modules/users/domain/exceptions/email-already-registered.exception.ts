import { ConflictDomainException } from '@shared/domain/domain.exception';

export class EmailAlreadyRegisteredException extends ConflictDomainException {
  readonly code = 'EMAIL_ALREADY_REGISTERED';

  constructor(email: string) {
    super(`An account with email "${email}" already exists.`);
  }
}

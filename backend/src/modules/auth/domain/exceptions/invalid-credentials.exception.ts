import { InvalidCredentialsDomainException } from '@shared/domain/domain.exception';

export class InvalidCredentialsException extends InvalidCredentialsDomainException {
  readonly code = 'INVALID_CREDENTIALS';

  constructor() {
    super('Email or password is incorrect.');
  }
}

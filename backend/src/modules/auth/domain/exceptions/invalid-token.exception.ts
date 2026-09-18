import { InvalidCredentialsDomainException } from '@shared/domain/domain.exception';

export class InvalidTokenException extends InvalidCredentialsDomainException {
  readonly code = 'INVALID_TOKEN';

  constructor(reason: 'expired' | 'revoked' | 'malformed' = 'malformed') {
    super(`Refresh token is ${reason}.`);
  }
}

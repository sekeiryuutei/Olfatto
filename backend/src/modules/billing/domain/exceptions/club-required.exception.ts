import { UnauthorizedDomainException } from '@shared/domain/domain.exception';

export class ClubRequiredException extends UnauthorizedDomainException {
  readonly code = 'CLUB_REQUIRED';

  constructor() {
    super('This feature is exclusive to Olfatto Club members.');
  }
}

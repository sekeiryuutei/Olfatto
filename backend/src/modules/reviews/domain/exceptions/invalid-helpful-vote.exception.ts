import { InvalidInputDomainException } from '@shared/domain/domain.exception';

export class InvalidHelpfulVoteException extends InvalidInputDomainException {
  readonly code = 'INVALID_HELPFUL_VOTE';

  constructor(reason: 'own_review' | 'already_voted') {
    super(
      reason === 'own_review'
        ? 'You cannot mark your own review as helpful.'
        : 'You already marked this review as helpful.',
    );
  }
}

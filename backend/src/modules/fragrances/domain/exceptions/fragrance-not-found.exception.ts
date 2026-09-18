import { NotFoundDomainException } from '@shared/domain/domain.exception';

export class FragranceNotFoundException extends NotFoundDomainException {
  readonly code = 'FRAGRANCE_NOT_FOUND';

  constructor(id: string) {
    super(`Fragrance "${id}" was not found.`);
  }
}

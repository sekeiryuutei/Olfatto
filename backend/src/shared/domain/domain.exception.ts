/**
 * Base for every domain exception. Domain/Application layers throw these;
 * Infrastructure (HttpExceptionFilter) maps them to HTTP responses.
 * Each concrete exception carries its own stable `code` (used in the API
 * error envelope, point 36) and the HTTP status it maps to.
 */
export abstract class DomainException extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export abstract class NotFoundDomainException extends DomainException {
  readonly httpStatus = 404;
}

export abstract class InvalidInputDomainException extends DomainException {
  readonly httpStatus = 400;
}

export abstract class UnauthorizedDomainException extends DomainException {
  readonly httpStatus = 403;
}

export abstract class InvalidCredentialsDomainException extends DomainException {
  readonly httpStatus = 401;
}

export abstract class ConflictDomainException extends DomainException {
  readonly httpStatus = 409;
}

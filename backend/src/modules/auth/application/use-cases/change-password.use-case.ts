import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/users/domain/repositories/user.repository.port';
import { UserNotFoundException } from '@modules/users/domain/exceptions/user-not-found.exception';
import { PASSWORD_HASHER, PasswordHasher } from '../../domain/ports/password-hasher.port';
import {
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenRepository,
} from '../../domain/ports/refresh-token.repository.port';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

// Distinct from ResetPassword (which is for a FORGOTTEN password via a
// mailed token) — this is for a logged-in user who knows their current
// password and wants to change it (point 3).
@Injectable()
export class ChangePasswordUseCase implements UseCase<ChangePasswordInput, void> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new UserNotFoundException(input.userId);

    if (!user.passwordHash) {
      // Google-only account (point 10) — no password to verify against.
      throw new InvalidCredentialsException();
    }

    const currentMatches = await this.passwordHasher.compare(
      input.currentPassword,
      user.passwordHash,
    );
    if (!currentMatches) throw new InvalidCredentialsException();

    const newHash = await this.passwordHasher.hash(input.newPassword);
    user.changePasswordHash(newHash);
    await this.userRepository.save(user);

    // Same as ResetPassword: a password change invalidates every existing session.
    await this.refreshTokenRepository.revokeAllForUser(user.id);
  }
}

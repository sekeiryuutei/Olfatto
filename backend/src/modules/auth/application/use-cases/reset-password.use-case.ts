import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/users/domain/repositories/user.repository.port';
import { UserNotFoundException } from '@modules/users/domain/exceptions/user-not-found.exception';
import { PASSWORD_HASHER, PasswordHasher } from '../../domain/ports/password-hasher.port';
import { TOKEN_SERVICE, TokenService } from '../../domain/ports/token-service.port';
import {
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenRepository,
} from '../../domain/ports/refresh-token.repository.port';
import { InvalidTokenException } from '../../domain/exceptions/invalid-token.exception';

export interface ResetPasswordInput {
  resetToken: string;
  newPassword: string;
}

@Injectable()
export class ResetPasswordUseCase implements UseCase<ResetPasswordInput, void> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    let payload: { sub: string };
    try {
      payload = this.tokenService.verifyPasswordResetToken(input.resetToken);
    } catch {
      throw new InvalidTokenException('malformed');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) throw new UserNotFoundException(payload.sub);

    const newHash = await this.passwordHasher.hash(input.newPassword);
    user.changePasswordHash(newHash);
    await this.userRepository.save(user);

    // Security best practice: invalidate every existing session once the
    // password changes.
    await this.refreshTokenRepository.revokeAllForUser(user.id);
  }
}

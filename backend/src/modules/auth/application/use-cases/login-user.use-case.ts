import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/users/domain/repositories/user.repository.port';
import { PASSWORD_HASHER, PasswordHasher } from '../../domain/ports/password-hasher.port';
import { TOKEN_SERVICE, TokenService } from '../../domain/ports/token-service.port';
import {
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenRepository,
} from '../../domain/ports/refresh-token.repository.port';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { AuthResult } from './register-user.use-case';

export interface LoginUserInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginUserUseCase implements UseCase<LoginUserInput, AuthResult> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(input: LoginUserInput): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(input.email);
    // Same error for "no such user" and "wrong password" — never reveal
    // which one it was (avoids user enumeration).
    if (!user || !user.passwordHash) {
      throw new InvalidCredentialsException();
    }

    const passwordMatches = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsException();
    }

    const tokens = this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.refreshTokenRepository.save({
      userId: user.id,
      tokenHash: this.tokenService.hashToken(tokens.refreshToken),
      expiresAt: tokens.refreshTokenExpiresAt,
      revoked: false,
    });

    return { user, tokens };
  }
}

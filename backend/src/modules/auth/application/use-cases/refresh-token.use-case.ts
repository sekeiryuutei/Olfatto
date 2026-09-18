import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/users/domain/repositories/user.repository.port';
import { TOKEN_SERVICE, TokenPair, TokenService } from '../../domain/ports/token-service.port';
import {
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenRepository,
} from '../../domain/ports/refresh-token.repository.port';
import { InvalidTokenException } from '../../domain/exceptions/invalid-token.exception';
import { UserNotFoundException } from '@modules/users/domain/exceptions/user-not-found.exception';

@Injectable()
export class RefreshTokenUseCase implements UseCase<string, TokenPair> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(refreshToken: string): Promise<TokenPair> {
    let payload: { sub: string };
    try {
      payload = this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new InvalidTokenException('malformed');
    }

    const tokenHash = this.tokenService.hashToken(refreshToken);
    const stored = await this.refreshTokenRepository.findValidByTokenHash(tokenHash);
    if (!stored) {
      throw new InvalidTokenException('revoked');
    }
    if (stored.expiresAt < new Date()) {
      throw new InvalidTokenException('expired');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) throw new UserNotFoundException(payload.sub);

    // Rotate: revoke the used refresh token, issue a brand new pair.
    await this.refreshTokenRepository.revoke(stored.id);

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

    return tokens;
  }
}

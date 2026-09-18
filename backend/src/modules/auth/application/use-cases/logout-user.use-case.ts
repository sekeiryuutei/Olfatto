import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { TOKEN_SERVICE, TokenService } from '../../domain/ports/token-service.port';
import {
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenRepository,
} from '../../domain/ports/refresh-token.repository.port';

@Injectable()
export class LogoutUserUseCase implements UseCase<string, void> {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(refreshToken);
    const stored = await this.refreshTokenRepository.findValidByTokenHash(tokenHash);
    // Idempotent: logging out with an already-invalid token is not an error.
    if (stored) {
      await this.refreshTokenRepository.revoke(stored.id);
    }
  }
}

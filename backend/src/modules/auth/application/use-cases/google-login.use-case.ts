import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/users/domain/repositories/user.repository.port';
import { CreateUserUseCase } from '@modules/users/application/use-cases/create-user.use-case';
import { TOKEN_SERVICE, TokenService } from '../../domain/ports/token-service.port';
import {
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenRepository,
} from '../../domain/ports/refresh-token.repository.port';
import { AuthResult } from './register-user.use-case';

export interface GoogleLoginInput {
  email: string;
  name: string;
}

@Injectable()
export class GoogleLoginUseCase implements UseCase<GoogleLoginInput, AuthResult> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly createUserUseCase: CreateUserUseCase,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(input: GoogleLoginInput): Promise<AuthResult> {
    let user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      // No password: this identity only exists via Google (point 10).
      user = await this.createUserUseCase.execute({
        email: input.email,
        name: input.name,
        passwordHash: null,
      });
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

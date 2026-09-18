import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { CreateUserUseCase } from '@modules/users/application/use-cases/create-user.use-case';
import { User } from '@modules/users/domain/entities/user.entity';
import { PASSWORD_HASHER, PasswordHasher } from '../../domain/ports/password-hasher.port';
import { TOKEN_SERVICE, TokenPair, TokenService } from '../../domain/ports/token-service.port';
import {
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenRepository,
} from '../../domain/ports/refresh-token.repository.port';

export interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthResult {
  user: User;
  tokens: TokenPair;
}

@Injectable()
export class RegisterUserUseCase implements UseCase<RegisterUserInput, AuthResult> {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthResult> {
    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = await this.createUserUseCase.execute({
      email: input.email,
      name: input.name,
      passwordHash,
    });

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

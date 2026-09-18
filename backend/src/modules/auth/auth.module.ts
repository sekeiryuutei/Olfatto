import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@modules/users/users.module';
import { RefreshTokenOrmEntity } from './infrastructure/persistence/refresh-token.orm-entity';
import { PostgresRefreshTokenRepository } from './infrastructure/persistence/postgres-refresh-token.repository';
import { REFRESH_TOKEN_REPOSITORY } from './domain/ports/refresh-token.repository.port';
import { PASSWORD_HASHER } from './domain/ports/password-hasher.port';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher.adapter';
import { TOKEN_SERVICE } from './domain/ports/token-service.port';
import { JwtTokenService } from './infrastructure/security/jwt-token.service.adapter';
import { MAIL_SERVICE } from './domain/ports/mail.port';
import { ConsoleMailAdapter } from './infrastructure/security/console-mail.adapter';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { GoogleStrategy } from './infrastructure/security/google.strategy';
import { AuthController } from './infrastructure/http/auth.controller';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUserUseCase } from './application/use-cases/logout-user.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { GoogleLoginUseCase } from './application/use-cases/google-login.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshTokenOrmEntity]),
    PassportModule,
    JwtModule.register({}), // secrets/expirations are supplied per-call (see JwtTokenService)
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: PostgresRefreshTokenRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    { provide: MAIL_SERVICE, useClass: ConsoleMailAdapter },
    JwtStrategy,
    GoogleStrategy,
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokenUseCase,
    LogoutUserUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    GoogleLoginUseCase,
  ],
})
export class AuthModule {}

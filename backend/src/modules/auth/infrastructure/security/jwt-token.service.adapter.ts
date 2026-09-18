import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { AppConfig } from '@config/configuration';
import {
  AccessTokenPayload,
  TokenPair,
  TokenService,
} from '../../domain/ports/token-service.port';

const PASSWORD_RESET_PURPOSE = 'password_reset';
const PASSWORD_RESET_EXPIRES_IN = '1h';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  generateTokenPair(payload: AccessTokenPayload): TokenPair {
    const jwtConfig = this.configService.get('jwt', { infer: true });

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: jwtConfig.expiresIn,
    });

    const refreshToken = this.jwtService.sign(
      { sub: payload.sub },
      { secret: jwtConfig.refreshSecret, expiresIn: jwtConfig.refreshExpiresIn },
    );

    const decoded = this.jwtService.decode(refreshToken) as { exp: number };
    const refreshTokenExpiresAt = new Date(decoded.exp * 1000);

    return { accessToken, refreshToken, refreshTokenExpiresAt };
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    const jwtConfig = this.configService.get('jwt', { infer: true });
    return this.jwtService.verify<AccessTokenPayload>(token, { secret: jwtConfig.secret });
  }

  verifyRefreshToken(token: string): { sub: string } {
    const jwtConfig = this.configService.get('jwt', { infer: true });
    return this.jwtService.verify<{ sub: string }>(token, { secret: jwtConfig.refreshSecret });
  }

  generatePasswordResetToken(userId: string): string {
    const jwtConfig = this.configService.get('jwt', { infer: true });
    // No dedicated DB table for reset tokens (kept out of the point-30 schema
    // on purpose) — a short-lived, purpose-tagged, signed token needs no
    // persistence and is verified by signature + expiry alone.
    return this.jwtService.sign(
      { sub: userId, purpose: PASSWORD_RESET_PURPOSE },
      { secret: jwtConfig.refreshSecret, expiresIn: PASSWORD_RESET_EXPIRES_IN },
    );
  }

  verifyPasswordResetToken(token: string): { sub: string } {
    const jwtConfig = this.configService.get('jwt', { infer: true });
    const payload = this.jwtService.verify<{ sub: string; purpose: string }>(token, {
      secret: jwtConfig.refreshSecret,
    });
    if (payload.purpose !== PASSWORD_RESET_PURPOSE) {
      throw new Error('Token is not a password reset token.');
    }
    return { sub: payload.sub };
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}

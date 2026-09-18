import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from '@config/configuration';
import { AccessTokenPayload } from '../../domain/ports/token-service.port';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt', { infer: true }).secret,
    });
  }

  // passport-jwt has already verified the signature and expiry by the time
  // this runs — we just pass the payload through as `request.user`.
  validate(payload: AccessTokenPayload): AccessTokenPayload {
    return payload;
  }
}

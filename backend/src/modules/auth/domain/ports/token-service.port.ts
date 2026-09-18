export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export interface TokenService {
  generateTokenPair(payload: AccessTokenPayload): TokenPair;
  verifyAccessToken(token: string): AccessTokenPayload;
  verifyRefreshToken(token: string): { sub: string };
  generatePasswordResetToken(userId: string): string;
  verifyPasswordResetToken(token: string): { sub: string };
  hashToken(token: string): string;
}

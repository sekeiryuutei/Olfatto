export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  corsOrigin: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
    clubPriceId: string;
    successUrl: string;
    cancelUrl: string;
    portalReturnUrl: string;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:8100',
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    name: process.env.DATABASE_NAME ?? 'olfatto',
    user: process.env.DATABASE_USER ?? 'olfatto_user',
    password: process.env.DATABASE_PASSWORD ?? '',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET ?? '',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? '',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    clubPriceId: process.env.STRIPE_CLUB_PRICE_ID ?? '',
    successUrl: process.env.STRIPE_SUCCESS_URL ?? 'http://localhost:8100/profile?club=success',
    cancelUrl: process.env.STRIPE_CANCEL_URL ?? 'http://localhost:8100/profile?club=canceled',
    portalReturnUrl: process.env.STRIPE_PORTAL_RETURN_URL ?? 'http://localhost:8100/profile',
  },
});

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { mkdirSync } from 'fs';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfig } from '@config/configuration';
import { setupSwagger } from '@config/swagger.config';

async function bootstrap(): Promise<void> {
  // Multer's diskStorage does not create its destination folder itself.
  mkdirSync(join(process.cwd(), 'uploads', 'avatars'), { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: false,
    rawBody: true, // required so /billing/webhook can verify Stripe's signature against the exact raw bytes
  });

  const configService = app.get(ConfigService<AppConfig, true>);
  const apiPrefix = configService.get('apiPrefix', { infer: true });
  const corsOrigin = configService.get('corsOrigin', { infer: true });
  const port = configService.get('port', { infer: true });
  const nodeEnv = configService.get('nodeEnv', { infer: true });

  // crossOriginResourcePolicy relaxed to 'cross-origin': the frontend (a
  // different origin in dev, e.g. :8100 vs :3100) needs to load uploaded
  // images directly via <img src="http://.../uploads/...">, which helmet's
  // default 'same-origin' policy would otherwise silently block.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Serves uploaded avatars at /uploads/avatars/<file> — point 4 (subida de
  // foto de perfil). Local disk for MVP simplicity; swap for S3/Cloudinary
  // before a real production launch (see docker-compose.yml note on the
  // uploads volume).
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties not declared in the DTO
      forbidNonWhitelisted: true, // rejects unexpected properties instead of silently dropping them
      transform: true, // enables @Type()-based coercion (e.g. query params -> numbers)
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  if (nodeEnv !== 'production') {
    setupSwagger(app, apiPrefix);
  }

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Olfatto API listening on port ${port} [${nodeEnv}]`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs: http://localhost:${port}/${apiPrefix}/docs`);
}

void bootstrap();

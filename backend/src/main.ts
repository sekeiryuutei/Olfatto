import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfig } from '@config/configuration';
import { setupSwagger } from '@config/swagger.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: false });

  const configService = app.get(ConfigService<AppConfig, true>);
  const apiPrefix = configService.get('apiPrefix', { infer: true });
  const corsOrigin = configService.get('corsOrigin', { infer: true });
  const port = configService.get('port', { infer: true });
  const nodeEnv = configService.get('nodeEnv', { infer: true });

  app.use(helmet());

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

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

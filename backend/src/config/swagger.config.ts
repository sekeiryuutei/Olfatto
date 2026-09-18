import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication, apiPrefix: string): void {
  const config = new DocumentBuilder()
    .setTitle('Olfatto API')
    .setDescription(
      'Descubrimiento, catalogación, reseñas y recomendación de fragancias. ' +
        'Modular Monolith · Hexagonal Architecture · DDD.',
    )
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .addTag('auth', 'Registro, login, tokens')
    .addTag('users', 'Perfil de usuario')
    .addTag('fragrances', 'Catálogo de fragancias')
    .addTag('reviews', 'Reseñas de usuarios')
    .addTag('health', 'Estado del servicio')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}

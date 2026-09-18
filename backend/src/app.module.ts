import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import configuration, { AppConfig } from '@config/configuration';
import { typeOrmConfig } from '@config/typeorm.config';
import { HttpExceptionFilter } from '@shared/infrastructure/filters/http-exception.filter';
import { ResponseInterceptor } from '@shared/infrastructure/interceptors/response.interceptor';
import { HealthModule } from '@shared/infrastructure/health/health.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { FragrancesModule } from '@modules/fragrances/fragrances.module';
import { ReviewsModule } from '@modules/reviews/reviews.module';
import { RankingsModule } from '@modules/rankings/rankings.module';
import { RecommendationsModule } from '@modules/recommendations/recommendations.module';
import { CollectionModule } from '@modules/collection/collection.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        ...typeOrmConfig,
        // typeOrmConfig already reads from process.env for the CLI; here we
        // go through Nest's ConfigService so tests can override values.
        host: configService.get('database', { infer: true }).host,
        port: configService.get('database', { infer: true }).port,
        username: configService.get('database', { infer: true }).user,
        password: configService.get('database', { infer: true }).password,
        database: configService.get('database', { infer: true }).name,
      }),
    }),

    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]), // global default; endpoints can override with @Throttle()

    HealthModule,
    AuthModule,
    UsersModule,
    FragrancesModule,
    ReviewsModule,
    RankingsModule,
    RecommendationsModule,
    CollectionModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}

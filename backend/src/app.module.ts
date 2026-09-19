import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
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
      // Explicit TypeOrmModuleOptions return type + a literal `type: 'postgres'`
      // below (rather than spreading typeOrmConfig, which is typed as the very
      // wide DataSourceOptions union) — spreading it made TS try to match an
      // unrelated union member (sqljs) and fail. Building the object directly
      // keeps `type` narrowed to the literal the postgres driver expects.
      useFactory: (configService: ConfigService<AppConfig, true>): TypeOrmModuleOptions => {
        const db = configService.get('database', { infer: true });
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.user,
          password: db.password,
          database: db.name,
          entities: typeOrmConfig.entities,
          migrations: typeOrmConfig.migrations,
          migrationsTableName: typeOrmConfig.migrationsTableName,
          synchronize: false,
          logging: typeOrmConfig.logging,
        };
      },
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

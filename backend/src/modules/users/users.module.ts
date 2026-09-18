import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { UserProfileOrmEntity } from './infrastructure/persistence/user-profile.orm-entity';
import { PostgresUserRepository } from './infrastructure/persistence/postgres-user.repository';
import { PostgresUserProfileRepository } from './infrastructure/persistence/postgres-user-profile.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository.port';
import { USER_PROFILE_REPOSITORY } from './domain/repositories/user-profile.repository.port';
import { UsersController } from './infrastructure/http/users.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetMeUseCase } from './application/use-cases/get-me.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity, UserProfileOrmEntity])],
  controllers: [UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: PostgresUserRepository },
    { provide: USER_PROFILE_REPOSITORY, useClass: PostgresUserProfileRepository },
    CreateUserUseCase,
    GetMeUseCase,
    UpdateUserUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
  ],
  // Exported so AuthModule can orchestrate registration/login without
  // duplicating the User persistence logic (point 92: "no duplicar lógica").
  exports: [USER_REPOSITORY, USER_PROFILE_REPOSITORY, CreateUserUseCase, GetMeUseCase],
})
export class UsersModule {}

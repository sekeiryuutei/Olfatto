import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '@shared/application/use-case.interface';
import { User } from '../../domain/entities/user.entity';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../domain/repositories/user.repository.port';
import {
  USER_PROFILE_REPOSITORY,
  UserProfileRepository,
} from '../../domain/repositories/user-profile.repository.port';
import { EmailAlreadyRegisteredException } from '../../domain/exceptions/email-already-registered.exception';

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string | null;
}

@Injectable()
export class CreateUserUseCase implements UseCase<CreateUserInput, User> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const alreadyExists = await this.userRepository.existsByEmail(input.email);
    if (alreadyExists) {
      throw new EmailAlreadyRegisteredException(input.email);
    }

    const user = User.create({
      id: randomUUID(),
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
    });

    const savedUser = await this.userRepository.save(user);

    const profile = UserProfile.createEmpty(randomUUID(), savedUser.id);
    await this.userProfileRepository.save(profile);

    return savedUser;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import {
  USER_PROFILE_REPOSITORY,
  UserProfileRepository,
} from '../../domain/repositories/user-profile.repository.port';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';

@Injectable()
export class GetUserProfileUseCase implements UseCase<string, UserProfile> {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly profileRepository: UserProfileRepository,
  ) {}

  async execute(userId: string): Promise<UserProfile> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new UserNotFoundException(userId);
    return profile;
  }
}

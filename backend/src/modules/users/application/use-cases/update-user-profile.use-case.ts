import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import {
  USER_PROFILE_REPOSITORY,
  UserProfileRepository,
} from '../../domain/repositories/user-profile.repository.port';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import {
  Climate,
  PreferredDuration,
  ProjectionLevel,
  RetentionLevel,
  SkinType,
  UsageOccasion,
} from '../../domain/value-objects/profile.enums';

export interface UpdateUserProfileInput {
  userId: string;
  skinType?: SkinType;
  retentionLevel?: RetentionLevel | null;
  preferredDuration?: PreferredDuration | null;
  preferredProjection?: ProjectionLevel | null;
  climate?: Climate | null;
  preferredFamilyIds?: string[];
  favoriteNoteIds?: string[];
  dislikedNoteIds?: string[];
  preferredUsages?: UsageOccasion[];
}

@Injectable()
export class UpdateUserProfileUseCase implements UseCase<UpdateUserProfileInput, UserProfile> {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly profileRepository: UserProfileRepository,
  ) {}

  async execute(input: UpdateUserProfileInput): Promise<UserProfile> {
    const profile = await this.profileRepository.findByUserId(input.userId);
    if (!profile) throw new UserNotFoundException(input.userId);

    const { userId: _userId, ...updates } = input;
    profile.update(updates);

    return this.profileRepository.save(profile);
  }
}

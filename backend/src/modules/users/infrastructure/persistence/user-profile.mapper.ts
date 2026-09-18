import { UserProfile } from '../../domain/entities/user-profile.entity';
import {
  Climate,
  PreferredDuration,
  ProjectionLevel,
  RetentionLevel,
  SkinType,
  UsageOccasion,
} from '../../domain/value-objects/profile.enums';
import { UserProfileOrmEntity } from './user-profile.orm-entity';

export class UserProfileMapper {
  static toDomain(orm: UserProfileOrmEntity): UserProfile {
    return UserProfile.reconstitute(orm.id, {
      userId: orm.userId,
      skinType: orm.skinType as SkinType,
      retentionLevel: orm.retentionLevel as RetentionLevel | null,
      preferredDuration: orm.preferredDuration as PreferredDuration | null,
      preferredProjection: orm.preferredProjection as ProjectionLevel | null,
      climate: orm.climate as Climate | null,
      preferredFamilyIds: orm.preferredFamilyIds ?? [],
      favoriteNoteIds: orm.favoriteNoteIds ?? [],
      dislikedNoteIds: orm.dislikedNoteIds ?? [],
      preferredUsages: (orm.preferredUsages ?? []) as UsageOccasion[],
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: UserProfile): UserProfileOrmEntity {
    const snapshot = domain.toSnapshot();
    const orm = new UserProfileOrmEntity();
    orm.id = domain.id;
    orm.userId = snapshot.userId;
    orm.skinType = snapshot.skinType;
    orm.retentionLevel = snapshot.retentionLevel;
    orm.preferredDuration = snapshot.preferredDuration;
    orm.preferredProjection = snapshot.preferredProjection;
    orm.climate = snapshot.climate;
    orm.preferredFamilyIds = snapshot.preferredFamilyIds;
    orm.favoriteNoteIds = snapshot.favoriteNoteIds;
    orm.dislikedNoteIds = snapshot.dislikedNoteIds;
    orm.preferredUsages = snapshot.preferredUsages;
    orm.createdAt = snapshot.createdAt;
    orm.updatedAt = snapshot.updatedAt;
    return orm;
  }
}

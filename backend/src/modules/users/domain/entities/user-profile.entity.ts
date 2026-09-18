import { BaseEntity } from '@shared/domain/base.entity';
import {
  Climate,
  PreferredDuration,
  ProjectionLevel,
  RetentionLevel,
  SkinType,
  UsageOccasion,
} from '../value-objects/profile.enums';

export interface UserProfileProps {
  userId: string;
  skinType: SkinType;
  retentionLevel: RetentionLevel | null;
  preferredDuration: PreferredDuration | null;
  preferredProjection: ProjectionLevel | null;
  climate: Climate | null;
  preferredFamilyIds: string[];
  favoriteNoteIds: string[];
  dislikedNoteIds: string[];
  preferredUsages: UsageOccasion[];
  createdAt: Date;
  updatedAt: Date;
}

export class UserProfile extends BaseEntity<UserProfileProps> {
  private constructor(id: string, props: UserProfileProps) {
    super(id, props);
  }

  /** Created automatically (empty/unknown) right after registration — point 10: "El perfil olfativo puede completarse posteriormente." */
  static createEmpty(id: string, userId: string): UserProfile {
    const now = new Date();
    return new UserProfile(id, {
      userId,
      skinType: SkinType.UNKNOWN,
      retentionLevel: null,
      preferredDuration: null,
      preferredProjection: null,
      climate: null,
      preferredFamilyIds: [],
      favoriteNoteIds: [],
      dislikedNoteIds: [],
      preferredUsages: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(id: string, props: UserProfileProps): UserProfile {
    return new UserProfile(id, props);
  }

  get userId(): string {
    return this.props.userId;
  }
  get skinType(): SkinType {
    return this.props.skinType;
  }
  get retentionLevel(): RetentionLevel | null {
    return this.props.retentionLevel;
  }
  get preferredDuration(): PreferredDuration | null {
    return this.props.preferredDuration;
  }
  get preferredProjection(): ProjectionLevel | null {
    return this.props.preferredProjection;
  }
  get climate(): Climate | null {
    return this.props.climate;
  }
  get preferredFamilyIds(): string[] {
    return [...this.props.preferredFamilyIds];
  }
  get favoriteNoteIds(): string[] {
    return [...this.props.favoriteNoteIds];
  }
  get dislikedNoteIds(): string[] {
    return [...this.props.dislikedNoteIds];
  }
  get preferredUsages(): UsageOccasion[] {
    return [...this.props.preferredUsages];
  }

  update(params: Partial<{
    skinType: SkinType;
    retentionLevel: RetentionLevel | null;
    preferredDuration: PreferredDuration | null;
    preferredProjection: ProjectionLevel | null;
    climate: Climate | null;
    preferredFamilyIds: string[];
    favoriteNoteIds: string[];
    dislikedNoteIds: string[];
    preferredUsages: UsageOccasion[];
  }>): void {
    // A note cannot be simultaneously favorite and disliked.
    const favorites = params.favoriteNoteIds ?? this.props.favoriteNoteIds;
    const disliked = params.dislikedNoteIds ?? this.props.dislikedNoteIds;
    const overlap = favorites.some((id) => disliked.includes(id));
    if (overlap) {
      throw new Error('A note cannot be both favorite and disliked.');
    }

    Object.assign(this.props, params, { updatedAt: new Date() });
  }

  toSnapshot(): UserProfileProps {
    return { ...this.props };
  }
}

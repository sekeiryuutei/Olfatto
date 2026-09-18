export enum SkinType {
  DRY = 'DRY',
  OILY = 'OILY',
  COMBINATION = 'COMBINATION',
  BALANCED = 'BALANCED',
  UNKNOWN = 'UNKNOWN',
}

export enum ProjectionLevel {
  INTIMATE = 'INTIMATE',
  MODERATE = 'MODERATE',
  STRONG = 'STRONG',
  ENORMOUS = 'ENORMOUS',
}

export enum RetentionLevel {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
}

export enum PreferredDuration {
  SHORT = 'SHORT',
  MODERATE = 'MODERATE',
  LONG = 'LONG',
  VERY_LONG = 'VERY_LONG',
}

export enum Climate {
  HOT = 'HOT',
  TEMPERATE = 'TEMPERATE',
  COLD = 'COLD',
  VARIABLE = 'VARIABLE',
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  emailVerified: boolean;
}

export interface UserProfile {
  userId: string;
  skinType: SkinType;
  retentionLevel: RetentionLevel | null;
  preferredDuration: PreferredDuration | null;
  preferredProjection: ProjectionLevel | null;
  climate: Climate | null;
  preferredFamilyIds: string[];
  favoriteNoteIds: string[];
  dislikedNoteIds: string[];
  preferredUsages: string[];
}

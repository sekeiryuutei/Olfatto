import { ProjectionLevel, SkinType } from './user.model';

export interface Review {
  id: string;
  userId: string;
  fragranceId: string;
  rating: number;
  durationHours: number;
  projection: ProjectionLevel;
  liked: boolean;
  comment: string | null;
  skinTypeSnapshot: SkinType;
  helpfulCount: number;
  createdAt: string;
}

export interface CreateReviewPayload {
  rating: number;
  durationHours: number;
  projection: ProjectionLevel;
  liked: boolean;
  comment?: string;
}

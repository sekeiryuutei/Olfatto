import { BaseEntity } from '@shared/domain/base.entity';
import { ProjectionLevel } from '@shared/domain/value-objects/projection-level.enum';
import { SkinType } from '@modules/users/domain/value-objects/profile.enums';
import { InvalidReviewException } from '../exceptions/invalid-review.exception';

const MAX_COMMENT_LENGTH = 280;
const MIN_RATING = 0;
const MAX_RATING = 5;
const MIN_DURATION_HOURS = 0;
const MAX_DURATION_HOURS = 24;

export interface ReviewProps {
  userId: string;
  fragranceId: string;
  rating: number;
  durationHours: number;
  projection: ProjectionLevel;
  liked: boolean;
  comment: string | null;
  /** Snapshot of the user's skin type at review time — never mutated after creation (point 70). */
  skinTypeSnapshot: SkinType;
  createdAt: Date;
  updatedAt: Date;
}

export class Review extends BaseEntity<ReviewProps> {
  private constructor(id: string, props: ReviewProps) {
    super(id, props);
  }

  static create(params: {
    id: string;
    userId: string;
    fragranceId: string;
    rating: number;
    durationHours: number;
    projection: ProjectionLevel;
    liked: boolean;
    comment?: string | null;
    skinTypeSnapshot: SkinType;
  }): Review {
    Review.validateRating(params.rating);
    Review.validateDuration(params.durationHours);
    Review.validateComment(params.comment);

    const now = new Date();
    return new Review(params.id, {
      userId: params.userId,
      fragranceId: params.fragranceId,
      rating: params.rating,
      durationHours: params.durationHours,
      projection: params.projection,
      liked: params.liked,
      comment: params.comment?.trim() || null,
      skinTypeSnapshot: params.skinTypeSnapshot,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(id: string, props: ReviewProps): Review {
    return new Review(id, props);
  }

  get userId(): string {
    return this.props.userId;
  }
  get fragranceId(): string {
    return this.props.fragranceId;
  }
  get rating(): number {
    return this.props.rating;
  }
  get durationHours(): number {
    return this.props.durationHours;
  }
  get projection(): ProjectionLevel {
    return this.props.projection;
  }
  get liked(): boolean {
    return this.props.liked;
  }
  get comment(): string | null {
    return this.props.comment;
  }
  get skinTypeSnapshot(): SkinType {
    return this.props.skinTypeSnapshot;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /** Ownership is checked by the use case (it has the requester's id); the entity enforces the content rules. skinTypeSnapshot is deliberately NOT editable here (point 70). */
  update(params: {
    rating?: number;
    durationHours?: number;
    projection?: ProjectionLevel;
    liked?: boolean;
    comment?: string | null;
  }): void {
    if (params.rating !== undefined) Review.validateRating(params.rating);
    if (params.durationHours !== undefined) Review.validateDuration(params.durationHours);
    if (params.comment !== undefined) Review.validateComment(params.comment);

    if (params.rating !== undefined) this.props.rating = params.rating;
    if (params.durationHours !== undefined) this.props.durationHours = params.durationHours;
    if (params.projection !== undefined) this.props.projection = params.projection;
    if (params.liked !== undefined) this.props.liked = params.liked;
    if (params.comment !== undefined) this.props.comment = params.comment?.trim() || null;
    this.props.updatedAt = new Date();
  }

  isOwnedBy(userId: string): boolean {
    return this.props.userId === userId;
  }

  private static validateRating(rating: number): void {
    if (rating < MIN_RATING || rating > MAX_RATING) {
      throw new InvalidReviewException(`rating must be between ${MIN_RATING} and ${MAX_RATING}.`);
    }
  }

  private static validateDuration(hours: number): void {
    if (hours < MIN_DURATION_HOURS || hours > MAX_DURATION_HOURS) {
      throw new InvalidReviewException(
        `durationHours must be between ${MIN_DURATION_HOURS} and ${MAX_DURATION_HOURS}.`,
      );
    }
  }

  private static validateComment(comment: string | null | undefined): void {
    if (comment && comment.length > MAX_COMMENT_LENGTH) {
      throw new InvalidReviewException(`comment must be at most ${MAX_COMMENT_LENGTH} characters.`);
    }
  }

  toSnapshot(): ReviewProps {
    return { ...this.props };
  }
}

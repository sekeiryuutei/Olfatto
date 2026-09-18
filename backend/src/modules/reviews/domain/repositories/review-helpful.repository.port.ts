export const REVIEW_HELPFUL_REPOSITORY = Symbol('REVIEW_HELPFUL_REPOSITORY');

export interface ReviewHelpfulRepository {
  mark(reviewId: string, userId: string): Promise<void>;
  unmark(reviewId: string, userId: string): Promise<void>;
  hasMarked(reviewId: string, userId: string): Promise<boolean>;
  countForReview(reviewId: string): Promise<number>;
}

import { Review } from '../entities/review.entity';

export const REVIEW_REPOSITORY = Symbol('REVIEW_REPOSITORY');

export type ReviewSortBy = 'mostRecent' | 'mostHelpful' | 'longestLasting';

export interface ListFragranceReviewsParams {
  fragranceId: string;
  sortBy: ReviewSortBy;
  page: number;
  limit: number;
}

/** A review plus the aggregates the review card needs (point 20/21). */
export interface ReviewListItem {
  review: Review;
  helpfulCount: number;
  authorName: string;
  authorAvatarUrl: string | null;
}

export interface ReviewRepository {
  save(review: Review): Promise<Review>;
  findById(id: string): Promise<Review | null>;
  findByUserAndFragrance(userId: string, fragranceId: string): Promise<Review | null>;
  delete(id: string): Promise<void>;
  listForFragrance(
    params: ListFragranceReviewsParams,
  ): Promise<{ items: ReviewListItem[]; total: number }>;
}

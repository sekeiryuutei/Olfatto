import { randomUUID } from 'crypto';
import { Review } from './review.entity';
import { InvalidReviewException } from '../exceptions/invalid-review.exception';
import { ProjectionLevel } from '@shared/domain/value-objects/projection-level.enum';
import { SkinType } from '@modules/users/domain/value-objects/profile.enums';

function buildValidReviewParams() {
  return {
    id: randomUUID(),
    userId: randomUUID(),
    fragranceId: randomUUID(),
    rating: 4.5,
    durationHours: 8,
    projection: ProjectionLevel.STRONG,
    liked: true,
    comment: 'Great longevity on my skin.',
    skinTypeSnapshot: SkinType.OILY,
  };
}

describe('Review entity', () => {
  it('creates a valid review', () => {
    const review = Review.create(buildValidReviewParams());
    expect(review.rating).toBe(4.5);
    expect(review.skinTypeSnapshot).toBe(SkinType.OILY);
  });

  it.each([-0.5, 5.5])('rejects rating %p outside [0,5]', (rating) => {
    expect(() => Review.create({ ...buildValidReviewParams(), rating })).toThrow(
      InvalidReviewException,
    );
  });

  it.each([-1, 25])('rejects durationHours %p outside [0,24]', (durationHours) => {
    expect(() => Review.create({ ...buildValidReviewParams(), durationHours })).toThrow(
      InvalidReviewException,
    );
  });

  it('rejects a comment longer than 280 characters', () => {
    const comment = 'a'.repeat(281);
    expect(() => Review.create({ ...buildValidReviewParams(), comment })).toThrow(
      InvalidReviewException,
    );
  });

  it('allows updating rating/duration/projection/comment', () => {
    const review = Review.create(buildValidReviewParams());
    review.update({ rating: 3, comment: 'Changed my mind.' });
    expect(review.rating).toBe(3);
    expect(review.comment).toBe('Changed my mind.');
  });

  it('never exposes a way to mutate skinTypeSnapshot after creation (point 70)', () => {
    const review = Review.create(buildValidReviewParams());
    const updateParams: Record<string, unknown> = { rating: 3 };
    // update() intentionally has no skinTypeSnapshot parameter in its type —
    // this assertion guards against someone adding one back in later.
    expect('skinTypeSnapshot' in updateParams).toBe(false);
    review.update(updateParams);
    expect(review.skinTypeSnapshot).toBe(SkinType.OILY);
  });

  it('identifies ownership correctly', () => {
    const params = buildValidReviewParams();
    const review = Review.create(params);
    expect(review.isOwnedBy(params.userId)).toBe(true);
    expect(review.isOwnedBy(randomUUID())).toBe(false);
  });
});

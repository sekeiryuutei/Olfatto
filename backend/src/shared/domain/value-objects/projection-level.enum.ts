/**
 * Shared across modules on purpose: a review reports the projection the
 * user *experienced*, a user profile stores the projection they *prefer*,
 * and a fragrance's aggregate stats summarize projection *across reviews*.
 * Same vocabulary, three different contexts — kept in the shared kernel so
 * none of those modules has to depend on another just for this enum.
 */
export enum ProjectionLevel {
  INTIMATE = 'INTIMATE',
  MODERATE = 'MODERATE',
  STRONG = 'STRONG',
  ENORMOUS = 'ENORMOUS',
}

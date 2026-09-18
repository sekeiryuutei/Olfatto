export enum SkinType {
  DRY = 'DRY',
  OILY = 'OILY',
  COMBINATION = 'COMBINATION',
  BALANCED = 'BALANCED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * How important duration/longevity is to the user.
 * Maps to onboarding screen 4: "¿Qué tan importante es para ti la duración?"
 * (Poco importante / Importante / Muy importante).
 */
export enum RetentionLevel {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
}

/**
 * The duration the user actually wants a fragrance to last.
 * Distinct from RetentionLevel (which measures *how much they care*,
 * not *how long they want it*). Section 11 lists both as separate
 * profile fields ("Nivel de duración preferido" vs the onboarding
 * importance question) — kept as separate enums so they're not
 * confused with each other in code.
 */
export enum PreferredDuration {
  SHORT = 'SHORT',
  MODERATE = 'MODERATE',
  LONG = 'LONG',
  VERY_LONG = 'VERY_LONG',
}

export { ProjectionLevel } from '@shared/domain/value-objects/projection-level.enum';

export enum Climate {
  HOT = 'HOT',
  TEMPERATE = 'TEMPERATE',
  COLD = 'COLD',
  VARIABLE = 'VARIABLE',
}

export enum UsageOccasion {
  DAILY = 'DAILY',
  WORK = 'WORK',
  DATES = 'DATES',
  EVENTS = 'EVENTS',
  NIGHT = 'NIGHT',
  SPORT = 'SPORT',
  FORMAL = 'FORMAL',
}

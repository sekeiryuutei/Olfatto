/**
 * Every use case implements this. Keeps Application-layer classes
 * framework-agnostic and consistently shaped: one public entry point.
 */
export interface UseCase<Input, Output> {
  execute(input: Input): Promise<Output>;
}

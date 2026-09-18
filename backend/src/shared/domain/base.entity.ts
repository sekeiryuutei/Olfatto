/**
 * Base class for every domain entity/aggregate root in Olfatto.
 *
 * Intentionally framework-agnostic: no decorators, no ORM, no HTTP.
 * Identity equality (not structural equality) defines entity equality.
 */
export abstract class BaseEntity<Props> {
  protected readonly _id: string;
  protected props: Props;

  protected constructor(id: string, props: Props) {
    this._id = id;
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  equals(other?: BaseEntity<Props>): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    return this._id === other._id;
  }
}

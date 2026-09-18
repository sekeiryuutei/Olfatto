import { BaseEntity } from '@shared/domain/base.entity';

export interface FamilyProps {
  name: string;
  createdAt: Date;
}

export class Family extends BaseEntity<FamilyProps> {
  private constructor(id: string, props: FamilyProps) {
    super(id, props);
  }

  static create(params: { id: string; name: string }): Family {
    if (!params.name || params.name.trim().length === 0) {
      throw new Error('Family name is required.');
    }
    return new Family(params.id, { name: params.name.trim(), createdAt: new Date() });
  }

  static reconstitute(id: string, props: FamilyProps): Family {
    return new Family(id, props);
  }

  get name(): string {
    return this.props.name;
  }

  toSnapshot(): FamilyProps {
    return { ...this.props };
  }
}

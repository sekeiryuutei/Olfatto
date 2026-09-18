import { BaseEntity } from '@shared/domain/base.entity';

export interface BrandProps {
  name: string;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Brand extends BaseEntity<BrandProps> {
  private constructor(id: string, props: BrandProps) {
    super(id, props);
  }

  static create(params: { id: string; name: string; logoUrl?: string | null }): Brand {
    if (!params.name || params.name.trim().length === 0) {
      throw new Error('Brand name is required.');
    }
    const now = new Date();
    return new Brand(params.id, {
      name: params.name.trim(),
      logoUrl: params.logoUrl ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(id: string, props: BrandProps): Brand {
    return new Brand(id, props);
  }

  get name(): string {
    return this.props.name;
  }
  get logoUrl(): string | null {
    return this.props.logoUrl;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toSnapshot(): BrandProps {
    return { ...this.props };
  }
}

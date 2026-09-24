import { BaseEntity } from '@shared/domain/base.entity';
import { Concentration } from '../value-objects/concentration.enum';
import { FragranceGender } from '../value-objects/gender.enum';

export interface FragranceProps {
  brandId: string;
  name: string;
  concentration: Concentration;
  gender: FragranceGender;
  releaseYear: number | null;
  description: string | null;
  imageUrl: string | null;
  affiliateUrl: string | null;
  noteIds: string[];
  familyIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CURRENT_YEAR = new Date().getFullYear();

export class Fragrance extends BaseEntity<FragranceProps> {
  private constructor(id: string, props: FragranceProps) {
    super(id, props);
  }

  static create(params: {
    id: string;
    brandId: string;
    name: string;
    concentration: Concentration;
    gender: FragranceGender;
    releaseYear?: number | null;
    description?: string | null;
    imageUrl?: string | null;
    affiliateUrl?: string | null;
    noteIds?: string[];
    familyIds?: string[];
  }): Fragrance {
    if (!params.name || params.name.trim().length === 0) {
      throw new Error('Fragrance name is required.');
    }
    if (
      params.releaseYear != null &&
      (params.releaseYear < 1900 || params.releaseYear > CURRENT_YEAR + 1)
    ) {
      throw new Error(`releaseYear must be between 1900 and ${CURRENT_YEAR + 1}.`);
    }

    const now = new Date();
    return new Fragrance(params.id, {
      brandId: params.brandId,
      name: params.name.trim(),
      concentration: params.concentration,
      gender: params.gender,
      releaseYear: params.releaseYear ?? null,
      description: params.description ?? null,
      imageUrl: params.imageUrl ?? null,
      affiliateUrl: params.affiliateUrl ?? null,
      noteIds: params.noteIds ?? [],
      familyIds: params.familyIds ?? [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(id: string, props: FragranceProps): Fragrance {
    return new Fragrance(id, props);
  }

  get brandId(): string {
    return this.props.brandId;
  }
  get name(): string {
    return this.props.name;
  }
  get concentration(): Concentration {
    return this.props.concentration;
  }
  get gender(): FragranceGender {
    return this.props.gender;
  }
  get releaseYear(): number | null {
    return this.props.releaseYear;
  }
  get description(): string | null {
    return this.props.description;
  }
  get imageUrl(): string | null {
    return this.props.imageUrl;
  }
  get affiliateUrl(): string | null {
    return this.props.affiliateUrl;
  }
  get noteIds(): string[] {
    return [...this.props.noteIds];
  }
  get familyIds(): string[] {
    return [...this.props.familyIds];
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(params: Partial<{
    name: string;
    concentration: Concentration;
    gender: FragranceGender;
    releaseYear: number | null;
    description: string | null;
    imageUrl: string | null;
    affiliateUrl: string | null;
    noteIds: string[];
    familyIds: string[];
  }>): void {
    if (params.name !== undefined) {
      if (params.name.trim().length === 0) throw new Error('Fragrance name cannot be empty.');
      this.props.name = params.name.trim();
    }
    if (
      params.releaseYear !== undefined &&
      params.releaseYear !== null &&
      (params.releaseYear < 1900 || params.releaseYear > CURRENT_YEAR + 1)
    ) {
      throw new Error(`releaseYear must be between 1900 and ${CURRENT_YEAR + 1}.`);
    }

    Object.assign(this.props, params, { updatedAt: new Date() });
  }

  toSnapshot(): FragranceProps {
    return { ...this.props };
  }
}

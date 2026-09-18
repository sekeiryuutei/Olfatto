import { BaseEntity } from '@shared/domain/base.entity';
import { UserRole } from '../value-objects/user-role.enum';

export interface UserProps {
  email: string;
  passwordHash: string | null; // null for accounts created via Google OAuth only
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends BaseEntity<UserProps> {
  private constructor(id: string, props: UserProps) {
    super(id, props);
  }

  static create(params: {
    id: string;
    email: string;
    passwordHash: string | null;
    name: string;
  }): User {
    const normalizedEmail = params.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error('Invalid email format.');
    }
    if (!params.name || params.name.trim().length === 0) {
      throw new Error('Name is required.');
    }

    const now = new Date();
    return new User(params.id, {
      email: normalizedEmail,
      passwordHash: params.passwordHash,
      name: params.name.trim(),
      avatarUrl: null,
      role: UserRole.USER,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(id: string, props: UserProps): User {
    return new User(id, props);
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string | null {
    return this.props.passwordHash;
  }

  get name(): string {
    return this.props.name;
  }

  get avatarUrl(): string | null {
    return this.props.avatarUrl;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateProfile(params: { name?: string; avatarUrl?: string | null }): void {
    if (params.name !== undefined) {
      if (params.name.trim().length === 0) {
        throw new Error('Name cannot be empty.');
      }
      this.props.name = params.name.trim();
    }
    if (params.avatarUrl !== undefined) {
      this.props.avatarUrl = params.avatarUrl;
    }
    this.props.updatedAt = new Date();
  }

  changePasswordHash(newHash: string): void {
    this.props.passwordHash = newHash;
    this.props.updatedAt = new Date();
  }

  toSnapshot(): UserProps {
    return { ...this.props };
  }
}

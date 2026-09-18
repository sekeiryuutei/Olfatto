import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { UserOrmEntity } from './user.orm-entity';

export class UserMapper {
  static toDomain(orm: UserOrmEntity): User {
    return User.reconstitute(orm.id, {
      email: orm.email,
      passwordHash: orm.passwordHash,
      name: orm.name,
      avatarUrl: orm.avatarUrl,
      role: orm.role as UserRole,
      emailVerified: orm.emailVerified,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: User): UserOrmEntity {
    const snapshot = domain.toSnapshot();
    const orm = new UserOrmEntity();
    orm.id = domain.id;
    orm.email = snapshot.email;
    orm.passwordHash = snapshot.passwordHash;
    orm.name = snapshot.name;
    orm.avatarUrl = snapshot.avatarUrl;
    orm.role = snapshot.role;
    orm.emailVerified = snapshot.emailVerified;
    orm.createdAt = snapshot.createdAt;
    orm.updatedAt = snapshot.updatedAt;
    return orm;
  }
}

import { Family } from '../../domain/entities/family.entity';
import { FamilyOrmEntity } from './family.orm-entity';

export class FamilyMapper {
  static toDomain(orm: FamilyOrmEntity): Family {
    return Family.reconstitute(orm.id, { name: orm.name, createdAt: orm.createdAt });
  }

  static toOrm(domain: Family): FamilyOrmEntity {
    const snapshot = domain.toSnapshot();
    const orm = new FamilyOrmEntity();
    orm.id = domain.id;
    orm.name = snapshot.name;
    orm.createdAt = snapshot.createdAt;
    return orm;
  }
}

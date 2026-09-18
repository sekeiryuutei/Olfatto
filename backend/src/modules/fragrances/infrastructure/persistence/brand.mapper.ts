import { Brand } from '../../domain/entities/brand.entity';
import { BrandOrmEntity } from './brand.orm-entity';

export class BrandMapper {
  static toDomain(orm: BrandOrmEntity): Brand {
    return Brand.reconstitute(orm.id, {
      name: orm.name,
      logoUrl: orm.logoUrl,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: Brand): BrandOrmEntity {
    const snapshot = domain.toSnapshot();
    const orm = new BrandOrmEntity();
    orm.id = domain.id;
    orm.name = snapshot.name;
    orm.logoUrl = snapshot.logoUrl;
    orm.createdAt = snapshot.createdAt;
    orm.updatedAt = snapshot.updatedAt;
    return orm;
  }
}

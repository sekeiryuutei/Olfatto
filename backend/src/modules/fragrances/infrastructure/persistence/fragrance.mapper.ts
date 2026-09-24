import { Fragrance } from '../../domain/entities/fragrance.entity';
import { Concentration } from '../../domain/value-objects/concentration.enum';
import { FragranceGender } from '../../domain/value-objects/gender.enum';
import { FragranceOrmEntity } from './fragrance.orm-entity';
import { NoteOrmEntity } from './note.orm-entity';
import { FamilyOrmEntity } from './family.orm-entity';

export class FragranceMapper {
  static toDomain(orm: FragranceOrmEntity): Fragrance {
    return Fragrance.reconstitute(orm.id, {
      brandId: orm.brandId,
      name: orm.name,
      concentration: orm.concentration as Concentration,
      gender: orm.gender as FragranceGender,
      releaseYear: orm.releaseYear,
      description: orm.description,
      imageUrl: orm.imageUrl,
      affiliateUrl: orm.affiliateUrl,
      noteIds: (orm.notes ?? []).map((n) => n.id),
      familyIds: (orm.families ?? []).map((f) => f.id),
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  /**
   * For notes/families TypeORM only needs the `id` to manage the join
   * table on save — stubbing the rest of each related entity is
   * intentional, not a bug.
   */
  static toOrm(domain: Fragrance): FragranceOrmEntity {
    const snapshot = domain.toSnapshot();
    const orm = new FragranceOrmEntity();
    orm.id = domain.id;
    orm.brandId = snapshot.brandId;
    orm.name = snapshot.name;
    orm.concentration = snapshot.concentration;
    orm.gender = snapshot.gender;
    orm.releaseYear = snapshot.releaseYear;
    orm.description = snapshot.description;
    orm.imageUrl = snapshot.imageUrl;
    orm.affiliateUrl = snapshot.affiliateUrl;
    orm.notes = snapshot.noteIds.map((id) => ({ id }) as NoteOrmEntity);
    orm.families = snapshot.familyIds.map((id) => ({ id }) as FamilyOrmEntity);
    orm.createdAt = snapshot.createdAt;
    orm.updatedAt = snapshot.updatedAt;
    return orm;
  }
}

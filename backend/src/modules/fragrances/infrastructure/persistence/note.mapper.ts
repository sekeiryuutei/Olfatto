import { Note } from '../../domain/entities/note.entity';
import { NoteOrmEntity } from './note.orm-entity';

export class NoteMapper {
  static toDomain(orm: NoteOrmEntity): Note {
    return Note.reconstitute(orm.id, { name: orm.name, createdAt: orm.createdAt });
  }

  static toOrm(domain: Note): NoteOrmEntity {
    const snapshot = domain.toSnapshot();
    const orm = new NoteOrmEntity();
    orm.id = domain.id;
    orm.name = snapshot.name;
    orm.createdAt = snapshot.createdAt;
    return orm;
  }
}

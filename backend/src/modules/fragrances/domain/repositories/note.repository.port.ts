import { Note } from '../entities/note.entity';

export const NOTE_REPOSITORY = Symbol('NOTE_REPOSITORY');

export interface NoteRepository {
  save(note: Note): Promise<Note>;
  findAll(): Promise<Note[]>;
  findByIds(ids: string[]): Promise<Note[]>;
}

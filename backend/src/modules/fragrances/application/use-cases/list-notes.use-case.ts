import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { Note } from '../../domain/entities/note.entity';
import { NOTE_REPOSITORY, NoteRepository } from '../../domain/repositories/note.repository.port';

@Injectable()
export class ListNotesUseCase implements UseCase<void, Note[]> {
  constructor(@Inject(NOTE_REPOSITORY) private readonly noteRepository: NoteRepository) {}

  execute(): Promise<Note[]> {
    return this.noteRepository.findAll();
  }
}

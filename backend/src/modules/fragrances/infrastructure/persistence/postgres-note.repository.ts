import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Note } from '../../domain/entities/note.entity';
import { NoteRepository } from '../../domain/repositories/note.repository.port';
import { NoteOrmEntity } from './note.orm-entity';
import { NoteMapper } from './note.mapper';

@Injectable()
export class PostgresNoteRepository implements NoteRepository {
  constructor(
    @InjectRepository(NoteOrmEntity) private readonly repo: Repository<NoteOrmEntity>,
  ) {}

  async save(note: Note): Promise<Note> {
    const saved = await this.repo.save(NoteMapper.toOrm(note));
    return NoteMapper.toDomain(saved);
  }

  async findAll(): Promise<Note[]> {
    const orms = await this.repo.find({ order: { name: 'ASC' } });
    return orms.map(NoteMapper.toDomain);
  }

  async findByIds(ids: string[]): Promise<Note[]> {
    if (ids.length === 0) return [];
    const orms = await this.repo.find({ where: { id: In(ids) } });
    return orms.map(NoteMapper.toDomain);
  }
}

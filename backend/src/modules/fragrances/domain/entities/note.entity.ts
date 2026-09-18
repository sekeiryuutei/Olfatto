import { BaseEntity } from '@shared/domain/base.entity';

export interface NoteProps {
  name: string;
  createdAt: Date;
}

export class Note extends BaseEntity<NoteProps> {
  private constructor(id: string, props: NoteProps) {
    super(id, props);
  }

  static create(params: { id: string; name: string }): Note {
    if (!params.name || params.name.trim().length === 0) {
      throw new Error('Note name is required.');
    }
    return new Note(params.id, { name: params.name.trim(), createdAt: new Date() });
  }

  static reconstitute(id: string, props: NoteProps): Note {
    return new Note(id, props);
  }

  get name(): string {
    return this.props.name;
  }

  toSnapshot(): NoteProps {
    return { ...this.props };
  }
}

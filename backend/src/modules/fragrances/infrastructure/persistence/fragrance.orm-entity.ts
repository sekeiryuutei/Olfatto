import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BrandOrmEntity } from './brand.orm-entity';
import { NoteOrmEntity } from './note.orm-entity';
import { FamilyOrmEntity } from './family.orm-entity';

@Entity('fragrances')
export class FragranceOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'brand_id', type: 'uuid' })
  brandId: string;

  @ManyToOne(() => BrandOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'brand_id' })
  brand: BrandOrmEntity;

  @Column()
  name: string;

  @Column({ type: 'varchar' })
  concentration: string;

  @Column({ type: 'varchar' })
  gender: string;

  @Column({ name: 'release_year', type: 'int', nullable: true })
  releaseYear: number | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl: string | null;

  @ManyToMany(() => NoteOrmEntity)
  @JoinTable({
    name: 'fragrance_notes',
    joinColumn: { name: 'fragrance_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'note_id', referencedColumnName: 'id' },
  })
  notes: NoteOrmEntity[];

  @ManyToMany(() => FamilyOrmEntity)
  @JoinTable({
    name: 'fragrance_families',
    joinColumn: { name: 'fragrance_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'family_id', referencedColumnName: 'id' },
  })
  families: FamilyOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

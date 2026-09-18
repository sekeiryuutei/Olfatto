import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';

@Entity('user_profiles')
export class UserProfileOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => UserOrmEntity, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({ name: 'skin_type', type: 'varchar', default: 'UNKNOWN' })
  skinType: string;

  @Column({ name: 'retention_level', type: 'varchar', nullable: true })
  retentionLevel: string | null;

  @Column({ name: 'preferred_duration', type: 'varchar', nullable: true })
  preferredDuration: string | null;

  @Column({ name: 'preferred_projection', type: 'varchar', nullable: true })
  preferredProjection: string | null;

  @Column({ type: 'varchar', nullable: true })
  climate: string | null;

  @Column({ name: 'preferred_family_ids', type: 'uuid', array: true, default: '{}' })
  preferredFamilyIds: string[];

  @Column({ name: 'favorite_note_ids', type: 'uuid', array: true, default: '{}' })
  favoriteNoteIds: string[];

  @Column({ name: 'disliked_note_ids', type: 'uuid', array: true, default: '{}' })
  dislikedNoteIds: string[];

  @Column({ name: 'preferred_usages', type: 'varchar', array: true, default: '{}' })
  preferredUsages: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reviews')
@Index(['userId', 'fragranceId'], { unique: true }) // point 70: one active review per user per fragrance
export class ReviewOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'fragrance_id', type: 'uuid' })
  @Index()
  fragranceId: string;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: string; // pg decimal columns round-trip as strings through pg driver

  @Column({ name: 'duration_hours', type: 'decimal', precision: 4, scale: 1 })
  durationHours: string;

  @Column({ type: 'varchar' })
  projection: string;

  @Column({ type: 'boolean' })
  liked: boolean;

  @Column({ type: 'varchar', length: 280, nullable: true })
  comment: string | null;

  @Column({ name: 'skin_type_snapshot', type: 'varchar' })
  skinTypeSnapshot: string;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

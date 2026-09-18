import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('collection_items')
@Index(['userId', 'fragranceId'], { unique: true })
export class CollectionItemOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ name: 'fragrance_id', type: 'uuid' })
  fragranceId: string;

  @Column({ type: 'varchar' })
  status: string; // OWNED | TESTED

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

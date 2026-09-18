import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('favorites')
@Index(['userId', 'fragranceId'], { unique: true })
export class FavoriteOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ name: 'fragrance_id', type: 'uuid' })
  fragranceId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

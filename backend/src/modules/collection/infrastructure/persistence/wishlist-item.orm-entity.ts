import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('wishlist_items')
@Index(['userId', 'fragranceId'], { unique: true })
export class WishlistItemOrmEntity {
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

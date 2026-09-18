import { ProjectionLevel } from '@shared/domain/value-objects/projection-level.enum';
import { SkinType } from '@modules/users/domain/value-objects/profile.enums';
import { Review } from '../../domain/entities/review.entity';
import { ReviewOrmEntity } from './review.orm-entity';

export class ReviewMapper {
  static toDomain(orm: ReviewOrmEntity): Review {
    return Review.reconstitute(orm.id, {
      userId: orm.userId,
      fragranceId: orm.fragranceId,
      rating: parseFloat(orm.rating),
      durationHours: parseFloat(orm.durationHours),
      projection: orm.projection as ProjectionLevel,
      liked: orm.liked,
      comment: orm.comment,
      skinTypeSnapshot: orm.skinTypeSnapshot as SkinType,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: Review): ReviewOrmEntity {
    const snapshot = domain.toSnapshot();
    const orm = new ReviewOrmEntity();
    orm.id = domain.id;
    orm.userId = snapshot.userId;
    orm.fragranceId = snapshot.fragranceId;
    orm.rating = snapshot.rating.toString();
    orm.durationHours = snapshot.durationHours.toString();
    orm.projection = snapshot.projection;
    orm.liked = snapshot.liked;
    orm.comment = snapshot.comment;
    orm.skinTypeSnapshot = snapshot.skinTypeSnapshot;
    orm.createdAt = snapshot.createdAt;
    orm.updatedAt = snapshot.updatedAt;
    return orm;
  }
}

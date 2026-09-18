import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FragrancesModule } from '@modules/fragrances/fragrances.module';
import { CollectionItemOrmEntity } from './infrastructure/persistence/collection-item.orm-entity';
import { WishlistItemOrmEntity } from './infrastructure/persistence/wishlist-item.orm-entity';
import { FavoriteOrmEntity } from './infrastructure/persistence/favorite.orm-entity';
import { PostgresCollectionRepository } from './infrastructure/persistence/postgres-collection.repository';
import { PostgresWishlistRepository } from './infrastructure/persistence/postgres-wishlist.repository';
import { PostgresFavoriteRepository } from './infrastructure/persistence/postgres-favorite.repository';
import { COLLECTION_REPOSITORY } from './domain/repositories/collection.repository.port';
import { WISHLIST_REPOSITORY } from './domain/repositories/wishlist.repository.port';
import { FAVORITE_REPOSITORY } from './domain/repositories/favorite.repository.port';
import { CollectionController } from './infrastructure/http/collection.controller';
import { AddToCollectionUseCase } from './application/use-cases/add-to-collection.use-case';
import { RemoveFromCollectionUseCase } from './application/use-cases/remove-from-collection.use-case';
import { ListCollectionUseCase } from './application/use-cases/list-collection.use-case';
import { AddToWishlistUseCase } from './application/use-cases/add-to-wishlist.use-case';
import { RemoveFromWishlistUseCase } from './application/use-cases/remove-from-wishlist.use-case';
import { ListWishlistUseCase } from './application/use-cases/list-wishlist.use-case';
import { AddFavoriteUseCase } from './application/use-cases/add-favorite.use-case';
import { RemoveFavoriteUseCase } from './application/use-cases/remove-favorite.use-case';
import { ListFavoritesUseCase } from './application/use-cases/list-favorites.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollectionItemOrmEntity, WishlistItemOrmEntity, FavoriteOrmEntity]),
    FragrancesModule,
  ],
  controllers: [CollectionController],
  providers: [
    { provide: COLLECTION_REPOSITORY, useClass: PostgresCollectionRepository },
    { provide: WISHLIST_REPOSITORY, useClass: PostgresWishlistRepository },
    { provide: FAVORITE_REPOSITORY, useClass: PostgresFavoriteRepository },
    AddToCollectionUseCase,
    RemoveFromCollectionUseCase,
    ListCollectionUseCase,
    AddToWishlistUseCase,
    RemoveFromWishlistUseCase,
    ListWishlistUseCase,
    AddFavoriteUseCase,
    RemoveFavoriteUseCase,
    ListFavoritesUseCase,
  ],
})
export class CollectionModule {}

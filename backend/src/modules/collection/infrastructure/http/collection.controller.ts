import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/infrastructure/security/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/infrastructure/security/current-user.decorator';
import { AddToCollectionUseCase } from '../../application/use-cases/add-to-collection.use-case';
import { RemoveFromCollectionUseCase } from '../../application/use-cases/remove-from-collection.use-case';
import { ListCollectionUseCase } from '../../application/use-cases/list-collection.use-case';
import { AddToWishlistUseCase } from '../../application/use-cases/add-to-wishlist.use-case';
import { RemoveFromWishlistUseCase } from '../../application/use-cases/remove-from-wishlist.use-case';
import { ListWishlistUseCase } from '../../application/use-cases/list-wishlist.use-case';
import { AddFavoriteUseCase } from '../../application/use-cases/add-favorite.use-case';
import { RemoveFavoriteUseCase } from '../../application/use-cases/remove-favorite.use-case';
import { ListFavoritesUseCase } from '../../application/use-cases/list-favorites.use-case';
import { AddCollectionItemDto } from './dto/add-collection-item.dto';
import { AddFragranceIdDto } from './dto/add-fragrance-id.dto';

@ApiTags('collection')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class CollectionController {
  constructor(
    private readonly addToCollectionUseCase: AddToCollectionUseCase,
    private readonly removeFromCollectionUseCase: RemoveFromCollectionUseCase,
    private readonly listCollectionUseCase: ListCollectionUseCase,
    private readonly addToWishlistUseCase: AddToWishlistUseCase,
    private readonly removeFromWishlistUseCase: RemoveFromWishlistUseCase,
    private readonly listWishlistUseCase: ListWishlistUseCase,
    private readonly addFavoriteUseCase: AddFavoriteUseCase,
    private readonly removeFavoriteUseCase: RemoveFavoriteUseCase,
    private readonly listFavoritesUseCase: ListFavoritesUseCase,
  ) {}

  // ---- Colección (Tengo / Probé) — point 25 ----

  @Get('collection')
  listCollection(@CurrentUser('sub') userId: string) {
    return this.listCollectionUseCase.execute(userId);
  }

  @Post('collection')
  addToCollection(@CurrentUser('sub') userId: string, @Body() dto: AddCollectionItemDto) {
    return this.addToCollectionUseCase.execute({ userId, ...dto });
  }

  @Delete('collection/:fragranceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFromCollection(
    @CurrentUser('sub') userId: string,
    @Param('fragranceId', ParseUUIDPipe) fragranceId: string,
  ): Promise<void> {
    return this.removeFromCollectionUseCase.execute({ userId, fragranceId });
  }

  // ---- Wishlist (Quiero) ----

  @Get('wishlist')
  listWishlist(@CurrentUser('sub') userId: string) {
    return this.listWishlistUseCase.execute(userId);
  }

  @Post('wishlist')
  addToWishlist(@CurrentUser('sub') userId: string, @Body() dto: AddFragranceIdDto) {
    return this.addToWishlistUseCase.execute({ userId, fragranceId: dto.fragranceId });
  }

  @Delete('wishlist/:fragranceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFromWishlist(
    @CurrentUser('sub') userId: string,
    @Param('fragranceId', ParseUUIDPipe) fragranceId: string,
  ): Promise<void> {
    return this.removeFromWishlistUseCase.execute({ userId, fragranceId });
  }

  // ---- Favoritos — endpoint no listado explícitamente en el punto 35,
  // agregado por simetría con la tabla `favorites` del punto 30 (ver
  // PROGRESS.md, sección de decisiones) ----

  @Get('favorites')
  listFavorites(@CurrentUser('sub') userId: string) {
    return this.listFavoritesUseCase.execute(userId);
  }

  @Post('favorites')
  addFavorite(@CurrentUser('sub') userId: string, @Body() dto: AddFragranceIdDto) {
    return this.addFavoriteUseCase.execute({ userId, fragranceId: dto.fragranceId });
  }

  @Delete('favorites/:fragranceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFavorite(
    @CurrentUser('sub') userId: string,
    @Param('fragranceId', ParseUUIDPipe) fragranceId: string,
  ): Promise<void> {
    return this.removeFavoriteUseCase.execute({ userId, fragranceId });
  }
}

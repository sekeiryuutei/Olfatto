import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/infrastructure/security/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/infrastructure/security/current-user.decorator';
import { CreateReviewUseCase } from '../../application/use-cases/create-review.use-case';
import { UpdateReviewUseCase } from '../../application/use-cases/update-review.use-case';
import { DeleteReviewUseCase } from '../../application/use-cases/delete-review.use-case';
import { ListFragranceReviewsUseCase } from '../../application/use-cases/list-fragrance-reviews.use-case';
import { MarkReviewHelpfulUseCase } from '../../application/use-cases/mark-review-helpful.use-case';
import { UnmarkReviewHelpfulUseCase } from '../../application/use-cases/unmark-review-helpful.use-case';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewsDto } from './dto/query-reviews.dto';
import { Review } from '../../domain/entities/review.entity';
import { ReviewListItem } from '../../domain/repositories/review.repository.port';

function toReviewResponse(review: Review, helpfulCount = 0) {
  return {
    id: review.id,
    userId: review.userId,
    fragranceId: review.fragranceId,
    rating: review.rating,
    durationHours: review.durationHours,
    projection: review.projection,
    liked: review.liked,
    comment: review.comment,
    skinTypeSnapshot: review.skinTypeSnapshot,
    helpfulCount,
    createdAt: review.createdAt,
  };
}

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly updateReviewUseCase: UpdateReviewUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase,
    private readonly listFragranceReviewsUseCase: ListFragranceReviewsUseCase,
    private readonly markReviewHelpfulUseCase: MarkReviewHelpfulUseCase,
    private readonly unmarkReviewHelpfulUseCase: UnmarkReviewHelpfulUseCase,
  ) {}

  @Get('fragrances/:fragranceId/reviews')
  async list(
    @Param('fragranceId', ParseUUIDPipe) fragranceId: string,
    @Query() query: QueryReviewsDto,
  ) {
    const result = await this.listFragranceReviewsUseCase.execute({
      fragranceId,
      sortBy: query.sortBy,
      page: query.page,
      limit: query.limit,
    });

    return {
      items: result.items.map((item: ReviewListItem) =>
        toReviewResponse(item.review, item.helpfulCount),
      ),
      meta: result.meta,
    };
  }

  @Post('fragrances/:fragranceId/reviews')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('fragranceId', ParseUUIDPipe) fragranceId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    const review = await this.createReviewUseCase.execute({ fragranceId, userId, ...dto });
    return toReviewResponse(review);
  }

  @Patch('reviews/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    const review = await this.updateReviewUseCase.execute({
      reviewId: id,
      requesterId: userId,
      ...dto,
    });
    return toReviewResponse(review);
  }

  @Delete('reviews/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') userId: string): Promise<void> {
    await this.deleteReviewUseCase.execute({ reviewId: id, requesterId: userId });
  }

  @Post('reviews/:id/helpful')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async markHelpful(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ): Promise<void> {
    await this.markReviewHelpfulUseCase.execute({ reviewId: id, userId });
  }

  @Delete('reviews/:id/helpful')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async unmarkHelpful(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ): Promise<void> {
    await this.unmarkReviewHelpfulUseCase.execute({ reviewId: id, userId });
  }
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@shared/infrastructure/dto/pagination-query.dto';
import { ReviewSortBy } from '../../../domain/repositories/review.repository.port';

const SORT_VALUES: ReviewSortBy[] = ['mostRecent', 'mostHelpful', 'longestLasting'];

export class QueryReviewsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: SORT_VALUES, default: 'mostRecent' })
  @IsOptional()
  @IsEnum(SORT_VALUES)
  sortBy: ReviewSortBy = 'mostRecent';
}

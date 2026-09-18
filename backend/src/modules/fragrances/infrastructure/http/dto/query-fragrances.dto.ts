import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { PaginationQueryDto } from '@shared/infrastructure/dto/pagination-query.dto';
import { Concentration } from '../../../domain/value-objects/concentration.enum';
import { FragranceGender } from '../../../domain/value-objects/gender.enum';
import { FragranceSortBy } from '../../../domain/repositories/fragrance.repository.port';

const SORT_VALUES: FragranceSortBy[] = [
  'relevance',
  'rating',
  'duration',
  'mostReviewed',
  'mostRecent',
];

const CURRENT_YEAR = new Date().getFullYear();

export class QueryFragrancesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Free-text search over the fragrance name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  familyId?: string;

  @ApiPropertyOptional({ enum: FragranceGender })
  @IsOptional()
  @IsEnum(FragranceGender)
  gender?: FragranceGender;

  @ApiPropertyOptional({ enum: Concentration })
  @IsOptional()
  @IsEnum(Concentration)
  concentration?: Concentration;

  @ApiPropertyOptional({ minimum: 1900, maximum: CURRENT_YEAR + 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(CURRENT_YEAR + 1)
  releaseYearFrom?: number;

  @ApiPropertyOptional({ minimum: 1900, maximum: CURRENT_YEAR + 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(CURRENT_YEAR + 1)
  releaseYearTo?: number;

  @ApiPropertyOptional({ enum: SORT_VALUES, default: 'relevance' })
  @IsOptional()
  @IsEnum(SORT_VALUES)
  sortBy: FragranceSortBy = 'relevance';
}

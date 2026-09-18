import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ProjectionLevel } from '@shared/domain/value-objects/projection-level.enum';

export class CreateReviewDto {
  @ApiProperty({ minimum: 0, maximum: 5, example: 4.5 })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  rating: number;

  @ApiProperty({ minimum: 0, maximum: 24, example: 8.5, description: 'Hours (point 19: 1h - 12h slider, capped at 24 per point 69)' })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(24)
  durationHours: number;

  @ApiProperty({ enum: ProjectionLevel })
  @IsEnum(ProjectionLevel)
  projection: ProjectionLevel;

  @ApiProperty({ example: true })
  @IsBoolean()
  liked: boolean;

  @ApiPropertyOptional({ maxLength: 280 })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  comment?: string;
}

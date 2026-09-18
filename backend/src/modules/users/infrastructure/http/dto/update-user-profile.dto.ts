import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsUUID } from 'class-validator';
import {
  Climate,
  PreferredDuration,
  ProjectionLevel,
  RetentionLevel,
  SkinType,
  UsageOccasion,
} from '../../../domain/value-objects/profile.enums';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ enum: SkinType })
  @IsOptional()
  @IsEnum(SkinType)
  skinType?: SkinType;

  @ApiPropertyOptional({ enum: RetentionLevel })
  @IsOptional()
  @IsEnum(RetentionLevel)
  retentionLevel?: RetentionLevel;

  @ApiPropertyOptional({ enum: PreferredDuration })
  @IsOptional()
  @IsEnum(PreferredDuration)
  preferredDuration?: PreferredDuration;

  @ApiPropertyOptional({ enum: ProjectionLevel })
  @IsOptional()
  @IsEnum(ProjectionLevel)
  preferredProjection?: ProjectionLevel;

  @ApiPropertyOptional({ enum: Climate })
  @IsOptional()
  @IsEnum(Climate)
  climate?: Climate;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  preferredFamilyIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  favoriteNoteIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  dislikedNoteIds?: string[];

  @ApiPropertyOptional({ enum: UsageOccasion, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(UsageOccasion, { each: true })
  preferredUsages?: UsageOccasion[];
}

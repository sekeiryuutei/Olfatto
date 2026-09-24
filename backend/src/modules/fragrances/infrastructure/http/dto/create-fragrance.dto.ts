import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Concentration } from '../../../domain/value-objects/concentration.enum';
import { FragranceGender } from '../../../domain/value-objects/gender.enum';

const CURRENT_YEAR = new Date().getFullYear();

export class CreateFragranceDto {
  @ApiProperty({ example: 'Sauvage' })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @ApiProperty()
  @IsUUID()
  brandId: string;

  @ApiProperty({ enum: Concentration })
  @IsEnum(Concentration)
  concentration: Concentration;

  @ApiProperty({ enum: FragranceGender })
  @IsEnum(FragranceGender)
  gender: FragranceGender;

  @ApiPropertyOptional({ minimum: 1900, maximum: CURRENT_YEAR + 1 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(CURRENT_YEAR + 1)
  releaseYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Link de afiliado a una tienda externa (punto de monetización 2)' })
  @IsOptional()
  @IsUrl()
  affiliateUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  noteIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  familyIds?: string[];
}

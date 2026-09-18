import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { CollectionStatus } from '../../../domain/repositories/collection.repository.port';

export class AddCollectionItemDto {
  @ApiProperty()
  @IsUUID()
  fragranceId: string;

  @ApiProperty({ enum: CollectionStatus })
  @IsEnum(CollectionStatus)
  status: CollectionStatus;
}

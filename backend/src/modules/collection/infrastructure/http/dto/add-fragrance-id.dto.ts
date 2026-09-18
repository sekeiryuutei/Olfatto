import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

// Shared shape for wishlist/favorites — both only need the fragrance id.
export class AddFragranceIdDto {
  @ApiProperty()
  @IsUUID()
  fragranceId: string;
}

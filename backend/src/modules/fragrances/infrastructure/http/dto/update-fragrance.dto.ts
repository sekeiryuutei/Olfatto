import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateFragranceDto } from './create-fragrance.dto';

// brandId is excluded: re-assigning a fragrance to a different brand is a
// data-fix operation, not a normal catalog edit, and isn't exposed here.
export class UpdateFragranceDto extends PartialType(
  OmitType(CreateFragranceDto, ['brandId'] as const),
) {}

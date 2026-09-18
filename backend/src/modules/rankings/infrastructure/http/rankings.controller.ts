import { Controller, Get, Query } from '@nestjs/common';
import { ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@shared/infrastructure/dto/pagination-query.dto';
import { SkinType } from '@modules/users/domain/value-objects/profile.enums';
import { GetGlobalRankingUseCase } from '../../application/use-cases/get-global-ranking.use-case';
import { GetSkinRankingUseCase } from '../../application/use-cases/get-skin-ranking.use-case';
import { GetLongevityRankingUseCase } from '../../application/use-cases/get-longevity-ranking.use-case';

class SkinRankingQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: SkinType })
  @IsOptional()
  @IsEnum(SkinType)
  skinType: SkinType = SkinType.UNKNOWN;
}

@ApiTags('rankings')
@Controller('rankings')
export class RankingsController {
  constructor(
    private readonly getGlobalRankingUseCase: GetGlobalRankingUseCase,
    private readonly getSkinRankingUseCase: GetSkinRankingUseCase,
    private readonly getLongevityRankingUseCase: GetLongevityRankingUseCase,
  ) {}

  @Get('global')
  async global(@Query() query: PaginationQueryDto) {
    return this.getGlobalRankingUseCase.execute({ page: query.page, limit: query.limit });
  }

  @Get('skin')
  async skin(@Query() query: SkinRankingQueryDto) {
    return this.getSkinRankingUseCase.execute({
      skinType: query.skinType,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('longevity')
  async longevity(@Query() query: PaginationQueryDto) {
    return this.getLongevityRankingUseCase.execute({ page: query.page, limit: query.limit });
  }
}

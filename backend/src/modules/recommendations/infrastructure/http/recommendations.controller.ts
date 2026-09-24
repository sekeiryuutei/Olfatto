import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/infrastructure/security/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/infrastructure/security/current-user.decorator';
import { ClubGuard } from '@modules/billing/infrastructure/security/club.guard';
import { GenerateRecommendationsUseCase } from '../../application/use-cases/generate-recommendations.use-case';

const FREE_RESULT_COUNT = 10;
const CLUB_RESULT_COUNT = 20;

@ApiTags('recommendations')
@ApiBearerAuth('access-token')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly generateRecommendationsUseCase: GenerateRecommendationsUseCase) {}

  @Get()
  async getMyRecommendations(@CurrentUser('sub') userId: string) {
    return this.generateRecommendationsUseCase.execute({ userId, resultCount: FREE_RESULT_COUNT });
  }

  // Monetización 1 (Olfatto Club): same rule-based algorithm, just more
  // results and the per-item reasoning exposed — not a different/"AI" model
  // under the hood yet (see docs/MONETIZATION.md for the honest framing).
  @Get('advanced')
  @UseGuards(ClubGuard)
  async getAdvancedRecommendations(@CurrentUser('sub') userId: string) {
    return this.generateRecommendationsUseCase.execute({ userId, resultCount: CLUB_RESULT_COUNT });
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/infrastructure/security/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/infrastructure/security/current-user.decorator';
import { GenerateRecommendationsUseCase } from '../../application/use-cases/generate-recommendations.use-case';

@ApiTags('recommendations')
@ApiBearerAuth('access-token')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly generateRecommendationsUseCase: GenerateRecommendationsUseCase) {}

  @Get()
  async getMyRecommendations(@CurrentUser('sub') userId: string) {
    return this.generateRecommendationsUseCase.execute(userId);
  }
}

import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/infrastructure/security/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/infrastructure/security/current-user.decorator';
import { GetMeUseCase } from '../../application/use-cases/get-me.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.use-case';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { User } from '../../domain/entities/user.entity';
import { UserProfile } from '../../domain/entities/user-profile.entity';

function toUserResponse(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}

function toProfileResponse(profile: UserProfile) {
  return {
    userId: profile.userId,
    skinType: profile.skinType,
    retentionLevel: profile.retentionLevel,
    preferredDuration: profile.preferredDuration,
    preferredProjection: profile.preferredProjection,
    climate: profile.climate,
    preferredFamilyIds: profile.preferredFamilyIds,
    favoriteNoteIds: profile.favoriteNoteIds,
    dislikedNoteIds: profile.dislikedNoteIds,
    preferredUsages: profile.preferredUsages,
  };
}

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(
    private readonly getMeUseCase: GetMeUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
  ) {}

  @Get()
  async getMe(@CurrentUser('sub') userId: string) {
    const user = await this.getMeUseCase.execute(userId);
    return toUserResponse(user);
  }

  @Patch()
  async updateMe(@CurrentUser('sub') userId: string, @Body() dto: UpdateUserDto) {
    const user = await this.updateUserUseCase.execute({ userId, ...dto });
    return toUserResponse(user);
  }

  @Get('profile')
  async getProfile(@CurrentUser('sub') userId: string) {
    const profile = await this.getUserProfileUseCase.execute(userId);
    return toProfileResponse(profile);
  }

  @Patch('profile')
  async updateProfile(@CurrentUser('sub') userId: string, @Body() dto: UpdateUserProfileDto) {
    const profile = await this.updateUserProfileUseCase.execute({ userId, ...dto });
    return toProfileResponse(profile);
  }
}

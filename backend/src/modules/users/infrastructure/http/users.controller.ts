import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
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

const ALLOWED_IMAGE_TYPES = /\.(jpg|jpeg|png|webp|gif)$/i;
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

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

  @Post('avatar')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req, file, callback) => {
          callback(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_IMAGE_TYPES.test(extname(file.originalname))) {
          callback(new BadRequestException('Only jpg, png, webp or gif images are allowed.'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded.');

    // Served statically from /uploads (see main.ts useStaticAssets). In dev
    // this lands on the bind-mounted ./backend/uploads folder on the host;
    // in production it needs a persistent volume (see docker-compose.yml) —
    // a real deployment should swap this for S3/Cloudinary instead of local
    // disk, but disk storage is a reasonable, honest choice for local/MVP use.
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    const user = await this.updateUserUseCase.execute({ userId, avatarUrl });
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

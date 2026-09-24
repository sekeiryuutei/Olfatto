import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/infrastructure/security/jwt-auth.guard';
import { Roles, RolesGuard } from '@modules/auth/infrastructure/security/roles.guard';
import { UserRole } from '@modules/users/domain/value-objects/user-role.enum';
import { CreateFragranceUseCase } from '../../application/use-cases/create-fragrance.use-case';
import { UpdateFragranceUseCase } from '../../application/use-cases/update-fragrance.use-case';
import { DeleteFragranceUseCase } from '../../application/use-cases/delete-fragrance.use-case';
import { GetFragranceDetailsUseCase, FragranceDetails } from '../../application/use-cases/get-fragrance-details.use-case';
import { ListFragrancesUseCase } from '../../application/use-cases/list-fragrances.use-case';
import { CreateFragranceDto } from './dto/create-fragrance.dto';
import { UpdateFragranceDto } from './dto/update-fragrance.dto';
import { QueryFragrancesDto } from './dto/query-fragrances.dto';
import { Fragrance } from '../../domain/entities/fragrance.entity';
import { FragranceListItem } from '../../domain/repositories/fragrance.repository.port';

function toFragranceSummary(item: FragranceListItem) {
  return {
    id: item.fragrance.id,
    name: item.fragrance.name,
    brandId: item.fragrance.brandId,
    concentration: item.fragrance.concentration,
    gender: item.fragrance.gender,
    imageUrl: item.fragrance.imageUrl,
    averageRating: item.averageRating,
    reviewCount: item.reviewCount,
    averageDurationHours: item.averageDurationHours,
  };
}

function toFragranceDetail(details: FragranceDetails) {
  const f: Fragrance = details.fragrance;
  return {
    id: f.id,
    name: f.name,
    concentration: f.concentration,
    gender: f.gender,
    releaseYear: f.releaseYear,
    description: f.description,
    imageUrl: f.imageUrl,
    affiliateUrl: f.affiliateUrl,
    brand: details.brand ? { id: details.brand.id, name: details.brand.name } : null,
    notes: details.notes.map((n) => ({ id: n.id, name: n.name })),
    families: details.families.map((fam) => ({ id: fam.id, name: fam.name })),
    performance: details.performance,
  };
}

@ApiTags('fragrances')
@Controller('fragrances')
export class FragrancesController {
  constructor(
    private readonly createFragranceUseCase: CreateFragranceUseCase,
    private readonly updateFragranceUseCase: UpdateFragranceUseCase,
    private readonly deleteFragranceUseCase: DeleteFragranceUseCase,
    private readonly getFragranceDetailsUseCase: GetFragranceDetailsUseCase,
    private readonly listFragrancesUseCase: ListFragrancesUseCase,
  ) {}

  @Get()
  async list(@Query() query: QueryFragrancesDto) {
    const result = await this.listFragrancesUseCase.execute({
      filters: {
        search: query.search,
        brandId: query.brandId,
        familyId: query.familyId,
        gender: query.gender,
        concentration: query.concentration,
        releaseYearFrom: query.releaseYearFrom,
        releaseYearTo: query.releaseYearTo,
      },
      sortBy: query.sortBy,
      page: query.page,
      limit: query.limit,
    });

    return { items: result.items.map(toFragranceSummary), meta: result.meta };
  }

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const details = await this.getFragranceDetailsUseCase.execute(id);
    return toFragranceDetail(details);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateFragranceDto) {
    const fragrance = await this.createFragranceUseCase.execute(dto);
    return { id: fragrance.id, name: fragrance.name };
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFragranceDto) {
    const fragrance = await this.updateFragranceUseCase.execute({ id, ...dto });
    return { id: fragrance.id, name: fragrance.name };
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteFragranceUseCase.execute(id);
  }
}

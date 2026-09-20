import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { JwtAuthGuard } from '@modules/auth/infrastructure/security/jwt-auth.guard';
import { ListBrandsUseCase } from '../../application/use-cases/list-brands.use-case';
import { CreateBrandUseCase } from '../../application/use-cases/create-brand.use-case';
import { ListFamiliesUseCase } from '../../application/use-cases/list-families.use-case';
import { ListNotesUseCase } from '../../application/use-cases/list-notes.use-case';

class CreateBrandDto {
  @ApiProperty({ example: 'Xerjoff' })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}

@ApiTags('catalog-reference')
@Controller()
export class CatalogReferenceController {
  constructor(
    private readonly listBrandsUseCase: ListBrandsUseCase,
    private readonly createBrandUseCase: CreateBrandUseCase,
    private readonly listFamiliesUseCase: ListFamiliesUseCase,
    private readonly listNotesUseCase: ListNotesUseCase,
  ) {}

  @Get('brands')
  async listBrands() {
    const brands = await this.listBrandsUseCase.execute();
    return brands.map((b) => ({ id: b.id, name: b.name, logoUrl: b.logoUrl }));
  }

  @Post('brands')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async createBrand(@Body() dto: CreateBrandDto) {
    const brand = await this.createBrandUseCase.execute(dto);
    return { id: brand.id, name: brand.name, logoUrl: brand.logoUrl };
  }

  @Get('families')
  async listFamilies() {
    const families = await this.listFamiliesUseCase.execute();
    return families.map((f) => ({ id: f.id, name: f.name }));
  }

  @Get('notes')
  async listNotes() {
    const notes = await this.listNotesUseCase.execute();
    return notes.map((n) => ({ id: n.id, name: n.name }));
  }
}

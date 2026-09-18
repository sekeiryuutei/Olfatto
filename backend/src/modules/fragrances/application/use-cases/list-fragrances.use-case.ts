import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { buildPaginationMeta, PaginatedResult } from '@shared/application/pagination';
import {
  FRAGRANCE_REPOSITORY,
  FragranceListItem,
  FragranceListParams,
  FragranceRepository,
} from '../../domain/repositories/fragrance.repository.port';

@Injectable()
export class ListFragrancesUseCase
  implements UseCase<FragranceListParams, PaginatedResult<FragranceListItem>>
{
  constructor(
    @Inject(FRAGRANCE_REPOSITORY) private readonly fragranceRepository: FragranceRepository,
  ) {}

  async execute(params: FragranceListParams): Promise<PaginatedResult<FragranceListItem>> {
    const { items, total } = await this.fragranceRepository.list(params);
    return {
      items,
      meta: buildPaginationMeta(params.page, params.limit, total),
    };
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { buildPaginationMeta, PaginatedResult } from '@shared/application/pagination';
import {
  ListFragranceReviewsParams,
  REVIEW_REPOSITORY,
  ReviewListItem,
  ReviewRepository,
} from '../../domain/repositories/review.repository.port';

@Injectable()
export class ListFragranceReviewsUseCase
  implements UseCase<ListFragranceReviewsParams, PaginatedResult<ReviewListItem>>
{
  constructor(@Inject(REVIEW_REPOSITORY) private readonly reviewRepository: ReviewRepository) {}

  async execute(params: ListFragranceReviewsParams): Promise<PaginatedResult<ReviewListItem>> {
    const { items, total } = await this.reviewRepository.listForFragrance(params);
    return { items, meta: buildPaginationMeta(params.page, params.limit, total) };
  }
}

export interface ApiEnvelope<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedEnvelope<T> {
  data: T[];
  meta: PaginationMeta;
}

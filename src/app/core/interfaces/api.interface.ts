export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

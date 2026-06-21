import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { map, Observable, OperatorFunction } from 'rxjs';
import { ApiResponse, PaginatedResult, PaginationMeta } from '../interfaces/api.interface';

export function toHttpParams(params: Record<string, string | number | boolean | null | undefined>): HttpParams {
  let httpParams = new HttpParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      httpParams = httpParams.set(key, String(value));
    }
  }
  return httpParams;
}

export function extractError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (Array.isArray(body?.message)) {
      return body.message.join(', ');
    }
    return body?.message ?? body?.detail ?? err.message ?? 'Something went wrong';
  }
  return 'Something went wrong';
}

export function unwrapData<T>(): OperatorFunction<ApiResponse<T> | T, T> {
  return map(response => {
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as ApiResponse<T>).data;
    }
    return response as T;
  });
}

export function unwrapPaginated<T>(): OperatorFunction<unknown, PaginatedResult<T>> {
  return map(response => normalizePaginated<T>(response));
}

export function normalizePaginated<T>(response: unknown): PaginatedResult<T> {
  if (!response || typeof response !== 'object') {
    return { data: [], meta: { total: 0, page: 1, limit: 20 } };
  }

  const r = response as Record<string, unknown>;

  if (Array.isArray(r['data']) && r['meta'] && typeof r['meta'] === 'object') {
    return { data: r['data'] as T[], meta: r['meta'] as PaginationMeta };
  }

  if (r['data'] && typeof r['data'] === 'object' && !Array.isArray(r['data'])) {
    const inner = r['data'] as Record<string, unknown>;
    if (Array.isArray(inner['data'])) {
      return {
        data: inner['data'] as T[],
        meta: (inner['meta'] as PaginationMeta) ?? defaultMeta(inner['data'] as T[]),
      };
    }
  }

  if (Array.isArray(r['data'])) {
    return { data: r['data'] as T[], meta: defaultMeta(r['data'] as T[]) };
  }

  if (Array.isArray(r['items'])) {
    return {
      data: r['items'] as T[],
      meta: {
        total: Number(r['total'] ?? (r['items'] as T[]).length),
        page: Number(r['page'] ?? 1),
        limit: Number(r['limit'] ?? (r['items'] as T[]).length),
        totalPages: Number(r['totalPages'] ?? 1),
      },
    };
  }

  if (Array.isArray(response)) {
    return { data: response as T[], meta: defaultMeta(response as T[]) };
  }

  return { data: [], meta: { total: 0, page: 1, limit: 20 } };
}

function defaultMeta<T>(items: T[]): PaginationMeta {
  return { total: items.length, page: 1, limit: items.length || 20, totalPages: 1 };
}

export function mapPaginated<T>(): OperatorFunction<unknown, PaginatedResult<T>> {
  return map(response => normalizePaginated<T>(response));
}

export function mapArray<T>(): OperatorFunction<unknown, T[]> {
  return map(response => {
    if (Array.isArray(response)) return response;
    if (response && typeof response === 'object') {
      const r = response as Record<string, unknown>;
      if (Array.isArray(r['data'])) return r['data'] as T[];
    }
    return [];
  });
}

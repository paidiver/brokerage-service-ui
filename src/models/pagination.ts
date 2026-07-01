export interface PaginatedResponse<TResults> {
  count: number;
  next: string | null;
  previous: string | null;
  results: TResults;
}

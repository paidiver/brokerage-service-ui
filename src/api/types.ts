import type {
  AnnotationRecord,
  AnnotationSearchInfo,
  AnnotationSummary
} from 'src/models/annotations';
import type { SourceConfig, SourceInfo } from 'src/models/sources';
import type { TaxonWormsLike } from 'src/models/taxanomies';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
  errors?: { field: string; message: string }[];
}

export interface UpstreamError {
  message: string;
  type: string;
}

export interface UpstreamResponse<ResponseDataT> {
  source: SourceConfig;
  method: string;
  path: string;
  url: string;
  ok: boolean;
  status_code?: number | null;
  data?: ResponseDataT | null;
  error?: UpstreamError | null;
}

export type TaxaBulkResponse = PaginatedResponse<TaxonWormsLike>;

export interface HealthCheckResponse {
  status: string;
}

export type SourcesInfoResponse = PaginatedResponse<SourceInfo>;

export interface SearchMetadata {
  info?: AnnotationSearchInfo | null;
  summary?: AnnotationSummary | null;
  source_counts: Record<string, number>;
}

export interface AnnotationsSearchResponse extends PaginatedResponse<AnnotationRecord> {
  meta: SearchMetadata;
}

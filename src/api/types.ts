import type {
  AnnotationRecord,
  AnnotationSearchInfo,
  AnnotationSummary
} from 'src/models/annotations';
import type { SourceConfig, SourceInfo } from 'src/models/sources';
import type { TaxonWormsLike } from 'src/models/taxanomies';

interface ResultsMetadata {
  total_results: number;
  results_from_individual_sources: Record<string, number>;
}
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  result_metadata: ResultsMetadata;
  results: T;
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

export interface TaxaBulkResponse {
  results: UpstreamResponse<TaxonWormsLike[]>[];
}

export interface HealthCheckResponse {
  status: string;
}

export interface SourcesInfoResponse {
  sources: SourceInfo[];
}

export type AnnotationsSearchResponse = PaginatedResponse<AnnotationSearchResponseResults>;

export interface AnnotationSearchResponseResults {
  info?: AnnotationSearchInfo | null;
  summary?: AnnotationSummary | null;
  annotations: AnnotationRecord[];
}

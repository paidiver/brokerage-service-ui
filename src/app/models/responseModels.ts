import { AnnotationRecord, AnnotationSummary } from './annotations'
import { SourceConfig, SourceInfo } from './sources'
import { TaxonWormsLike } from './taxanomies'

export interface PaginatedResponse<T> {
    count: number
    next: string | null
    previous: string | null
    results: T
}

export interface UpstreamError {
    message: string
    type: string
}

export interface UpstreamResponse<ResponseDataT> {
    source: SourceConfig
    method: string
    path: string
    url: string
    ok: boolean
    status_code?: number | null
    data?: ResponseDataT | null
    error?: UpstreamError | null
}

export interface TaxaBulkResponse {
    results: UpstreamResponse<TaxonWormsLike[]>[]
}

export interface HealthCheckResponse {
    status: string
}

export interface SourcesInfoResponse {
    sources: SourceInfo[]
}

export interface AnnotationSearchResponse {
    summary: AnnotationSummary
    results: AnnotationRecord[]
}

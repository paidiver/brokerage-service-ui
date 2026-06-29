export interface UpstreamError {
    message: string
    type: string
}


export interface PaginatedResponse<T> {
    count: number
    next: string | null
    previous: string | null
    results: T
}

export interface SourceConfig {
    name: string
    label: string
    base_url: string
    enabled: boolean
    kind: string
    timeout: {
        connect: number
        read: number
        write: number
        pool: number
    }
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

export interface TaxonWormsLike {
    AphiaID: number
    scientificname: string
    url?: string | null 
    status?: string | null
    rank?: string | null
    valid_AphiaID?: number | null
    valid_name?: string | null
    modified?: Date | null
    cached_at?: Date | null
    parent_AphiaID?: number | null
}

export interface TaxaBulkResponse {
    results: UpstreamResponse<TaxonWormsLike[]>[]
}


export interface HealthCheckResponse {
    status: string
}


export interface SourceInfo {
    source_name: string
    source_label: string
    base_url: string
    status: 'ok' | 'unhealthy' | 'unknown'
}


export interface SourcesInfoResponse {
    sources: SourceInfo[]
}


export interface AnnotationSummary {
    n_annotations: number
    n_images: number
    n_annotation_sets: number
    n_image_sets: number
}

export interface AnnotationRecord {
    source: string
    uuid: string
    image_filename: string
    image_handle: string
    image_uuid: string
    label_name: string
    label_aphia_id: number
    annotation_platform: string
    annotation_creation_datetime: Date
    annotation_shape: string
    annotation_coordinates: [number, number][]
    annotation_dimension_pixels: number
    annotator_name: string
    annotation_set_uuid: string
    annotation_set_name: string
    image_set_uuid: string
    image_set_name: string
}

export interface AnnotationSearchResponse {
    summary: AnnotationSummary
    results: AnnotationRecord[]
}

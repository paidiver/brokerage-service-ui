export interface UpstreamError {
    message: string
    type: string
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

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

export interface SourceInfo {
    source_name: string
    source_label: string
    base_url: string
    status: 'ok' | 'unhealthy' | 'unknown'
}

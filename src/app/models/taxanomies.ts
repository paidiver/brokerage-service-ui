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

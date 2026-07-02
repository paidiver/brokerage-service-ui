export interface TaxonWormsLikeItem {
  AphiaID: number;
  scientificname: string;
  url?: string | null;
  status?: string | null;
  rank?: string | null;
  valid_AphiaID?: number | null;
  valid_name?: string | null;
  modified?: Date | null;
  cached_at?: Date | null;
  parent_AphiaID?: number | null;
}

export type TaxonWormsLike = TaxonWormsLikeItem;

export interface TaxonWormsLikeResponse {
  results: TaxonWormsLikeItem[];
}

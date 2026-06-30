export interface Params {
  page_size: number;
  page: number;
  aphia_ids?: number[];
  name_part?: string;
  include_descendants?: boolean;
  calculate_summary?: boolean;
}

export interface SearchTerms {
  fieldType: 'name_part' | 'aphia_ids';
  value: string | [number, string];
}

export interface WormsResult {
  AphiaID: number;
  scientificname: string;
  url: string;
  rank: string;
  status: string;
  valid_AphiaID: number;
  valid_name: string;
  modified: string;
  cached_at: string;
  parent_AphiaID: number;
}

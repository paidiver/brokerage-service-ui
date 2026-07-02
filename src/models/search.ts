export interface SearchParams extends AdditionalFilters {
  page_size: number;
  page: number;
  aphia_ids?: number[];
  name_part?: string;
  include_descendants?: boolean;
  calculate_summary?: boolean;
  return_image_annotation_name_info?: boolean;
  sources?: string[];
}

export interface AdditionalFilters {
  deployment?: Deployment;
  fauna_attraction?: FaunaAttraction;
  image_set_name?: string;
  marine_zone?: MarineZone;
  max_lat?: number;
  max_lon?: number;
  min_lat?: number;
  min_lon?: number;
  platform?: string;
  project?: string;
}

export interface ExcludeFilters {
  exclude_annotation_set?: string[];
  exclude_aphia_ids?: number[];
  exclude_image_set?: string[];
}

export interface SearchTerms {
  fieldType: 'name_part' | 'aphia_ids';
  value: string | [number, string];
}

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

export const deploymentOptions = [
  { value: 'experiment', label: 'Experiment' },
  { value: 'exploration', label: 'Exploration' },
  { value: 'mapping', label: 'Mapping' },
  { value: 'sampling', label: 'Sampling' },
  { value: 'stationary', label: 'Stationary' },
  { value: 'survey', label: 'Survey' }
] as const satisfies readonly SelectOption<string>[];

export type Deployment = (typeof deploymentOptions)[number]['value'];

export const faunaAttractionOptions = [
  { value: 'none', label: 'None' },
  { value: 'baited', label: 'Baited' },
  { value: 'light', label: 'Light' }
] as const satisfies readonly SelectOption<string>[];

export type FaunaAttraction = (typeof faunaAttractionOptions)[number]['value'];

export const marineZoneOptions = [
  { value: 'atmosphere', label: 'Atmosphere' },
  { value: 'laboratory', label: 'Laboratory' },
  { value: 'sea_surface', label: 'Sea surface' },
  { value: 'seafloor', label: 'Seafloor' },
  { value: 'water_column', label: 'Water column' }
] as const satisfies readonly SelectOption<string>[];

export type MarineZone = (typeof marineZoneOptions)[number]['value'];

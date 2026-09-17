export interface AnnotationSummary {
  n_annotations: number;
  n_images: number;
  n_annotation_sets: number;
  n_image_sets: number;
}

export interface AnnotationSearchInfo {
  image_sets: { uuid: string; name: string }[];
  annotation_sets: { uuid: string; name: string }[];
  aphia_ids: { aphia_id: number; scientific_name: string; rank?: string | null }[];
}

export type AnnotationCoordinates = [number, number][];

export interface AnnotationRecord {
  image_latitude?: number | null;
  image_longitude?: number | null;
  source: string;
  uuid: string;
  image_filename: string;
  image_handle: string | null;
  image_uuid: string;
  label_name: string;
  label_aphia_id: number | null;
  annotation_platform: string | null;
  annotation_creation_datetime: string;
  annotation_shape: string;
  annotation_coordinates: AnnotationCoordinates;
  annotation_dimension_pixels: number | null;
  annotator_name: string | null;
  annotation_set_uuid: string;
  annotation_set_name: string;
  image_set_uuid: string;
  image_set_name: string;
}

import { PaginatedResponse } from './pagination';

export interface AnnotationSummary {
  n_annotations: number;
  n_images: number;
  n_annotation_sets: number;
  n_image_sets: number;
}

export type AnnotationCoordinates = [number, number][];

export interface AnnotationRecord {
  source: string;
  uuid: string;
  image_filename: string;
  image_handle: string;
  image_uuid: string;
  label_name: string;
  label_aphia_id: number;
  annotation_platform: string;
  annotation_creation_datetime: string;
  annotation_shape: string;
  annotation_coordinates: AnnotationCoordinates;
  annotation_dimension_pixels: number;
  annotator_name: string;
  annotation_set_uuid: string;
  annotation_set_name: string;
  image_set_uuid: string;
  image_set_name: string;
}

export interface AnnotationResults {
  summary: AnnotationSummary;
  annotations: AnnotationRecord[];
}

export type AnnotationsSearchResponse = PaginatedResponse<AnnotationResults>;

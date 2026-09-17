import { AnnotationRecord } from '../../models/annotations';
import { AdditionalFilters } from '../../models/search';

export type MapArea = Required<
  Pick<AdditionalFilters, 'min_lat' | 'max_lat' | 'min_lon' | 'max_lon'>
>;

export function annotationPosition(annotation: AnnotationRecord): [number, number] | null {
  const { image_longitude: lon, image_latitude: lat } = annotation;
  return typeof lon === 'number' &&
    typeof lat === 'number' &&
    Number.isFinite(lon) &&
    Number.isFinite(lat) &&
    Math.abs(lon) <= 180 &&
    Math.abs(lat) <= 90
    ? [lon, lat]
    : null;
}

export function searchArea(west: number, south: number, east: number, north: number): MapArea {
  return {
    min_lon: Math.max(-180, Math.min(180, west)),
    max_lon: Math.max(-180, Math.min(180, east)),
    min_lat: Math.max(-90, south),
    max_lat: Math.min(90, north)
  };
}

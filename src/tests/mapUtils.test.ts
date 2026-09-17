import { describe, expect, it } from 'vitest';

import { annotationPosition, searchArea } from '../components/annotations/mapUtils';
import { AnnotationRecord } from '../models/annotations';

describe('annotation locations', () => {
  it('uses geographic image coordinates, including zero, in longitude/latitude order', () => {
    expect(
      annotationPosition({ image_latitude: 50, image_longitude: -4 } as AnnotationRecord)
    ).toEqual([-4, 50]);
    expect(
      annotationPosition({ image_latitude: 0, image_longitude: 0 } as AnnotationRecord)
    ).toEqual([0, 0]);
  });
  it('omits missing and invalid positions without using pixel coordinates', () => {
    for (const fields of [
      {},
      { image_latitude: null, image_longitude: 2 },
      { image_latitude: 91, image_longitude: 2 },
      { image_latitude: 2, image_longitude: NaN }
    ]) {
      expect(
        annotationPosition({ ...fields, annotation_coordinates: [[2, 3]] } as AnnotationRecord)
      ).toBeNull();
    }
  });
  it('clamps viewport bounds to supported geographic limits', () => {
    expect(searchArea(-181, -91, 181, 91)).toEqual({
      min_lon: -180,
      max_lon: 180,
      min_lat: -90,
      max_lat: 90
    });
  });
  it('keeps bounds valid when panning beyond the edge of the world', () => {
    expect(searchArea(185, 40, 195, 50)).toEqual({
      min_lon: 180,
      max_lon: 180,
      min_lat: 40,
      max_lat: 50
    });
    expect(searchArea(-195, 40, -185, 50)).toEqual({
      min_lon: -180,
      max_lon: -180,
      min_lat: 40,
      max_lat: 50
    });
  });
});

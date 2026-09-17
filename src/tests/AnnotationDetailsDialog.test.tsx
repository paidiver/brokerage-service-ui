/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { AnnotationCard } from '../components/annotations/AnnotationCard';
import { AnnotationDetailsDialog } from '../components/annotations/AnnotationDetailsDialog';
import { AnnotationRecord } from '../models/annotations';

const annotation: AnnotationRecord = {
  source: 'bodc',
  uuid: 'annotation-id',
  image_filename: 'survey.jpg',
  image_handle: 'https://example.test/survey.jpg',
  image_uuid: 'image-id',
  image_latitude: 50,
  image_longitude: -4,
  label_name: 'Gadus morhua',
  label_aphia_id: 126436,
  annotation_platform: null,
  annotation_creation_datetime: '2026-01-02T12:00:00Z',
  annotation_shape: 'polygon',
  annotation_coordinates: [[1, 2]],
  annotation_dimension_pixels: 42,
  annotator_name: 'A. Researcher',
  annotation_set_uuid: 'annotation-set-id',
  annotation_set_name: 'Survey annotations',
  image_set_uuid: 'image-set-id',
  image_set_name: 'Survey images'
};

afterEach(cleanup);

it('opens annotation cards through their accessible action', () => {
  const onOpenDetails = vi.fn();
  render(<AnnotationCard annotation={annotation} onOpenDetails={onOpenDetails} />);

  fireEvent.click(screen.getByRole('button', { name: 'View details for Gadus morhua' }));
  expect(onOpenDetails).toHaveBeenCalledWith(annotation);
});

it('shows the available annotation details and closes the modal', () => {
  const onClose = vi.fn();
  render(<AnnotationDetailsDialog annotation={annotation} onClose={onClose} />);

  expect(screen.getByRole('dialog', { name: 'Annotation details' })).toBeTruthy();
  expect(screen.getByText('Gadus morhua')).toBeTruthy();
  expect(screen.getByText('Survey annotations')).toBeTruthy();
  expect(screen.getByText('Survey images')).toBeTruthy();
  expect(screen.getByText('BODC')).toBeTruthy();
  expect(screen.getByText('Not available')).toBeTruthy();
  const download = screen.getByRole('link', { name: 'Download image' });
  expect(download.getAttribute('href')).toBe('https://example.test/survey.jpg');
  expect(download.getAttribute('download')).toBe('survey.jpg');

  fireEvent.click(screen.getByRole('button', { name: 'Close annotation details' }));
  expect(onClose).toHaveBeenCalledOnce();
});

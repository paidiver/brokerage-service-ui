import { describe, expect, it, vi } from 'vitest';

import { annotationExportParams, downloadAnnotationExport } from '../api/annotationExport';
import { downloadFile } from '../api/apiClient';

vi.mock('../api/apiClient', () => ({ downloadFile: vi.fn() }));

describe('annotation metadata export', () => {
  it('keeps active filters and removes pagination-only parameters', () => {
    expect(
      annotationExportParams({
        page: 3,
        page_size: 20,
        name_part: 'cod',
        sources: ['bodc', 'jncc'],
        aphia_ids: [126436],
        exclude_aphia_ids: [1],
        min_lat: 40,
        add_summary: true,
        add_info: true
      })
    ).toEqual({
      name_part: 'cod',
      sources: ['bodc', 'jncc'],
      'aphia_ids[]': [126436],
      'exclude_aphia_ids[]': [1],
      min_lat: 40
    });
  });

  it('downloads the export ZIP from the brokerage endpoint', async () => {
    await downloadAnnotationExport({ page: 1, page_size: 20, name_part: 'cod' });

    expect(downloadFile).toHaveBeenCalledWith({
      url: '/annotations/export',
      defaultFilename: 'annotation_export.zip',
      params: { name_part: 'cod' },
      timeout: 120000
    });
  });
});

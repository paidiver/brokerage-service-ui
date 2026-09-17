import { SearchParams } from 'src/models/search';

import { downloadFile } from './apiClient';

const listAliases = {
  aphia_ids: 'aphia_ids[]',
  exclude_annotation_set: 'exclude_annotation_set[]',
  exclude_aphia_ids: 'exclude_aphia_ids[]',
  exclude_image_set: 'exclude_image_set[]'
} as const;

export function annotationExportParams(params: SearchParams): Record<string, unknown> {
  const query: Record<string, unknown> = { ...params };
  for (const key of [
    'page',
    'page_size',
    'add_summary',
    'add_info',
    'return_image_annotation_name_info'
  ]) {
    delete query[key];
  }

  for (const [key, alias] of Object.entries(listAliases)) {
    const value = query[key];
    if (value !== undefined) {
      query[alias] = value;
      delete query[key];
    }
  }

  return query;
}

export async function downloadAnnotationExport(params: SearchParams): Promise<void> {
  await downloadFile({
    url: '/annotations/export',
    defaultFilename: 'annotation_export.zip',
    params: annotationExportParams(params),
    timeout: 120000
  });
}

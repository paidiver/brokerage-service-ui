import axios from 'axios';
import qs from 'qs';
import { SearchResponse, SearchTerms } from 'src/types/annotation';

import { buildSearchParams } from './utils';

export const API_BASE = `${process.env.NEXT_PUBLIC_ANNOTATIONS_API || 'http://localhost:8000'}/api/`;
export const SEARCH_URL = 'annotations/search/grouped/';

export async function fetchGroupedAnnotations(
  page: number,
  searchTerm: SearchTerms | null,
  includeDescendants: boolean
): Promise<SearchResponse> {
  const params = buildSearchParams(page, searchTerm, includeDescendants, true, 20);

  const response = await axios.get<SearchResponse>(`${API_BASE}${SEARCH_URL}`, {
    params,
    paramsSerializer: currentParams => qs.stringify(currentParams, { arrayFormat: 'brackets' })
  });

  return response.data;
}

import {
  deploymentOptions,
  faunaAttractionOptions,
  marineZoneOptions,
  SearchParams,
  SearchTerms
} from 'src/models/search';

export const SEARCH_STORAGE_KEY = 'brokerage.search.v1';
const listKeys = [
  'aphia_ids',
  'sources',
  'exclude_annotation_set',
  'exclude_aphia_ids',
  'exclude_image_set'
];
const stringKeys = [
  'name_part',
  'deployment',
  'fauna_attraction',
  'image_set_name',
  'marine_zone',
  'platform',
  'project',
  'order_by'
];
const numberKeys = ['page', 'page_size', 'min_lat', 'max_lat', 'min_lon', 'max_lon'];
const boolKeys = [
  'include_descendants',
  'add_summary',
  'add_info',
  'return_image_annotation_name_info'
];
const keys = [...listKeys, ...stringKeys, ...numberKeys, ...boolKeys];
const queryKey = (key: string) => (key === 'exclude_aphia_ids' ? 'exclude_aphia_ids[]' : key);

export function searchQuery(params: SearchParams): URLSearchParams {
  const query = new URLSearchParams({ search: '1' });
  const data = params as unknown as Record<string, unknown>;
  for (const key of keys) {
    const value = data[key];
    const outputKey = queryKey(key);
    if (Array.isArray(value)) value.forEach(item => query.append(outputKey, String(item)));
    else if (value !== undefined) query.set(outputKey, String(value));
  }
  return query;
}

export function readSearch(query: URLSearchParams): SearchParams | null {
  if (!query.has('search') && !keys.some(key => query.has(key) || query.has(queryKey(key))))
    return null;
  const result: Record<string, unknown> = {
    page: 1,
    page_size: 20,
    add_summary: true,
    add_info: true,
    order_by: 'annotation_creation_datetime'
  };
  const invalid = () => {
    throw new Error(
      'This search link contains invalid filters. Please adjust the search and try again.'
    );
  };
  for (const key of keys) {
    const values = [...query.getAll(queryKey(key)), ...(queryKey(key) === key ? [] : query.getAll(key))];
    if (values.length === 0) continue;
    const value = values[0];
    if (listKeys.includes(key)) {
      if (values.some(item => !item.trim())) invalid();
      if (key === 'aphia_ids' || key === 'exclude_aphia_ids') {
        const numbers = values.map(Number);
        if (numbers.some(number => !Number.isSafeInteger(number) || number < 1)) invalid();
        result[key] = numbers;
      } else {
        if (key === 'sources' && values.some(item => !/^[a-z0-9_-]+$/.test(item))) invalid();
        if (
          key !== 'sources' &&
          values.some(item => !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(item))
        )
          invalid();
        result[key] = values;
      }
    } else {
      if (values.length !== 1 || !value.trim()) invalid();
      if (numberKeys.includes(key)) {
        const number = Number(value);
        if (!Number.isFinite(number)) invalid();
        if (key === 'page' || key === 'page_size') {
          if (!Number.isSafeInteger(number) || number < 1 || (key === 'page_size' && number > 500))
            invalid();
        } else if (Math.abs(number) > (key.endsWith('lat') ? 90 : 180)) invalid();
        result[key] = number;
      } else if (boolKeys.includes(key)) {
        if (!['true', 'false'].includes(value)) invalid();
        result[key] = value === 'true';
      } else result[key] = value;
    }
  }
  for (const [key, allowed] of Object.entries({
    deployment: deploymentOptions.map(option => option.value),
    fauna_attraction: faunaAttractionOptions.map(option => option.value),
    marine_zone: marineZoneOptions.map(option => option.value),
    order_by: ['label_aphia_id', 'annotation_creation_datetime', 'label_name']
  }))
    if (result[key] !== undefined && !(allowed as readonly string[]).includes(String(result[key])))
      invalid();
  for (const key of ['name_part', 'image_set_name', 'platform', 'project']) {
    if (result[key] !== undefined && String(result[key]).trim().length < 3) invalid();
  }
  if (!result.name_part && !result.aphia_ids) invalid();
  if (
    result.min_lat !== undefined &&
    result.max_lat !== undefined &&
    Number(result.min_lat) > Number(result.max_lat)
  )
    invalid();
  return result as unknown as SearchParams;
}

export function searchSignature(params: SearchParams): string {
  return searchQuery({ ...params, page: 1 }).toString();
}

export function searchUrl(params: SearchParams): string {
  const url = new URL(window.location.href);
  ['search', ...keys].forEach(key => {
    url.searchParams.delete(key);
    url.searchParams.delete(queryKey(key));
  });
  searchQuery(params).forEach((value, key) => url.searchParams.append(key, value));
  return url.toString();
}

export interface StoredSearch {
  version: 1;
  params: SearchParams;
  searchId: string;
  expiresAt: string;
  terms: SearchTerms[];
}

export function storeSearch(search: StoredSearch): void {
  try {
    sessionStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(search));
  } catch {
    /* Browsing still works without storage. */
  }
}
export function clearStoredSearch(): void {
  try {
    sessionStorage.removeItem(SEARCH_STORAGE_KEY);
  } catch {
    /* Storage can be disabled. */
  }
}
export function readStoredSearch(): StoredSearch | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(SEARCH_STORAGE_KEY) || 'null');
    if (
      !value ||
      value.version !== 1 ||
      typeof value.searchId !== 'string' ||
      !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value.searchId) ||
      !Number.isFinite(Date.parse(value.expiresAt))
    )
      return null;
    const params = readSearch(searchQuery(value.params));
    if (!params) return null;
    const terms: SearchTerms[] = Array.isArray(value.terms)
      ? value.terms.filter(
          (term: SearchTerms) =>
            term &&
            (term.fieldType === 'name_part'
              ? typeof term.value === 'string'
              : term.fieldType === 'aphia_ids' &&
                Array.isArray(term.value) &&
                Number.isSafeInteger(term.value[0]) &&
                typeof term.value[1] === 'string')
        )
      : [];
    return { version: 1, params, searchId: value.searchId, expiresAt: value.expiresAt, terms };
  } catch {
    return null;
  }
}

export function clearSearchUrl(): void {
  const url = new URL(window.location.href);
  ['search', ...keys].forEach(key => url.searchParams.delete(key));
  window.history.pushState(window.history.state, '', url);
}

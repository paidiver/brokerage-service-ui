/** @vitest-environment jsdom */
import MockAdapter from 'axios-mock-adapter';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../api/apiClient';
import { retryDelay, sessionRequest } from '../api/searchSessions';
import {
  readSearch,
  readStoredSearch,
  SEARCH_STORAGE_KEY,
  searchQuery,
  searchSignature,
  searchUrl
} from '../utils/searchLocation';

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('shareable search parameters', () => {
  it('round trips repeated IDs, sources, exclusions, bounds, sorting and boolean false', () => {
    const params = {
      name_part: 'crab & cod',
      aphia_ids: [1, 2],
      sources: ['bodc', 'jncc'],
      include_descendants: false,
      add_summary: true,
      add_info: true,
      page: 68,
      page_size: 20,
      order_by: 'label_aphia_id' as const,
      min_lat: -30,
      max_lat: 0,
      min_lon: 170,
      max_lon: -170,
      exclude_aphia_ids: [3],
      exclude_image_set: ['00000000-0000-0000-0000-000000000001'],
      deployment: 'survey' as const,
      marine_zone: 'sea surface' as const
    };
    expect(readSearch(searchQuery(params))).toEqual(params);
    expect(searchSignature(params)).toBe(searchSignature({ ...params, page: 1 }));
    expect(searchUrl(params)).not.toContain('search_id');
  });

  it.each([
    'page=0',
    'page=NaN',
    'page_size=501',
    'include_descendants=yes',
    'order_by=bad',
    'sources=../bad',
    'aphia_ids=2.5',
    'exclude_image_set=bad',
    'min_lat=91',
    'deployment=bad',
    'min_lat=20&max_lat=10',
    'page=1&page=2'
  ])('rejects invalid URL fields: %s', fields => {
    expect(() => readSearch(new URLSearchParams(`name_part=cod&${fields}`))).toThrow(
      'invalid filters'
    );
  });

  it('treats unrecognized query parameters as unrelated to searches', () => {
    expect(readSearch(new URLSearchParams('utm_source=example'))).toBeNull();
    window.history.replaceState(null, '', '/?utm_source=example');
    expect(
      new URL(searchUrl({ name_part: 'cod', page: 1, page_size: 20 })).searchParams.get(
        'utm_source'
      )
    ).toBe('example');
  });

  it('ignores corrupt or inaccessible storage', () => {
    sessionStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify({ version: 100 }));
    expect(readStoredSearch()).toBeNull();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(readStoredSearch()).toBeNull();
  });
});

it('preserves preparation responses, respects Retry-After and uses a session-specific timeout', async () => {
  const mock = new MockAdapter(apiClient);
  try {
    mock.onPost('/annotations/search/sessions').reply(config => {
      expect(config.timeout).toBe(60000);
      expect(JSON.parse(config.data)).toEqual({ name_part: 'cod' });
      return [202, { status: 'preparing' }, { 'retry-after': '3' }];
    });
    expect(
      await sessionRequest({
        method: 'POST',
        url: '/annotations/search/sessions',
        data: { name_part: 'cod' }
      })
    ).toMatchObject({ data: { status: 'preparing' }, retryAfter: 3000 });
    expect(retryDelay(undefined)).toBe(1000);
    expect(retryDelay('invalid')).toBe(1000);
    expect(retryDelay('-1')).toBe(1000);
    expect(retryDelay(new Date(Date.now() + 60000).toUTCString())).toBeGreaterThan(58000);
  } finally {
    mock.restore();
  }
});

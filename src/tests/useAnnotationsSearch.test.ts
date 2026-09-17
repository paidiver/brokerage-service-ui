/** @vitest-environment jsdom */
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { sessionRequest } from '../api/searchSessions';
import { useAnnotationsSearch } from '../hooks/useAnnotationsSearch';
import { SEARCH_STORAGE_KEY, storeSearch } from '../utils/searchLocation';

vi.mock('../api/searchSessions', async importOriginal => ({
  ...(await importOriginal<typeof import('../api/searchSessions')>()),
  sessionRequest: vi.fn()
}));
const request = vi.mocked(sessionRequest);
const id = '00000000-0000-0000-0000-000000000001';
const expires = () => new Date(Date.now() + 1800000).toISOString();
const response = (page = 1, uuid = 'first', count = 1360) =>
  ({
    data: {
      count,
      next: null,
      previous: null,
      results: [{ uuid }],
      meta: {
        search_id: id,
        page,
        page_size: 20,
        total_pages: Math.ceil(count / 20),
        generated_through_page: page,
        expires_at: expires(),
        source_counts: { bodc: count },
        summary: null
      }
    },
    retryAfter: 1000
  }) as unknown as Awaited<ReturnType<typeof sessionRequest>>;
const pending = (page = 68) => ({
  data: {
    count: 1360,
    status: 'preparing' as const,
    meta: {
      search_id: id,
      page,
      page_size: 20,
      total_pages: 68,
      generated_through_page: 10,
      expires_at: expires(),
      source_counts: { bodc: 1360 }
    }
  },
  retryAfter: 1000
});
const params = {
  name_part: 'cod',
  page: 3,
  page_size: 20,
  add_summary: true,
  add_info: true,
  include_descendants: true,
  order_by: 'annotation_creation_datetime' as const,
  sources: ['bodc']
};

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  sessionStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.resetAllMocks();
});

async function start() {
  const hook = renderHook(() => useAnnotationsSearch());
  act(() => hook.result.current.setSearchInput('cod'));
  await act(() => hook.result.current.submitSearch());
  return hook;
}

describe('search sessions', () => {
  it('restores a shared search without counting search settings as additional filters', async () => {
    window.history.replaceState(
      null,
      '',
      '/?search=1&aphia_ids=1360&sources=bodc&sources=jncc&order_by=annotation_creation_datetime&page=1&page_size=20&include_descendants=false&add_summary=true&add_info=true'
    );
    request.mockResolvedValue(response());
    const { result } = renderHook(() => useAnnotationsSearch());
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(result.current.additionalFilters).toEqual({});
    expect(result.current.selectedSources).toEqual(['bodc', 'jncc']);
  });

  it('creates searches with submitted filters and navigates using only session ID', async () => {
    request.mockImplementation(async config =>
      response(Number(config.url?.split('/').at(-1)) || 1)
    );
    const { result } = renderHook(() => useAnnotationsSearch());
    act(() => {
      result.current.setSearchInput('cod');
      result.current.setSelectedSources(['bodc']);
      result.current.setAdditionalFilters({ deployment: 'survey' });
      result.current.setIncludeDescendants(true);
    });
    await act(() => result.current.submitSearch());
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: '/annotations/search/sessions',
        data: expect.objectContaining({
          name_part: 'cod',
          sources: ['bodc'],
          deployment: 'survey',
          include_descendants: true,
          page: 1
        })
      })
    );
    act(() => result.current.setSearchInput('unsubmitted draft'));
    for (const page of [3, 4, 3]) {
      await act(() => result.current.goToPage(page));
      expect(result.current.currentPage).toBe(page);
      expect(request).toHaveBeenLastCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/annotations/search/sessions/${id}/pages/${page}`
        })
      );
      expect(request.mock.calls.at(-1)?.[0]).not.toHaveProperty('data');
    }
    expect(new URL(result.current.shareUrl!).searchParams.get('name_part')).toBe('cod');
    expect(result.current.shareUrl).not.toContain(id);
    await act(() => result.current.submitSearch());
    expect(request.mock.calls.at(-1)?.[0].method).toBe('POST');
    expect(result.current.currentPage).toBe(1);
  });

  it('polls 202 responses while retaining the current cards', async () => {
    vi.useFakeTimers();
    request
      .mockResolvedValueOnce(response())
      .mockResolvedValueOnce(pending())
      .mockResolvedValueOnce(response(68, 'last'));
    const { result } = await start();
    let navigation!: Promise<void>;
    await act(async () => {
      navigation = result.current.goToPage(68);
    });
    expect(result.current.preparing).toContain('Preparing page 68');
    expect(result.current.currentPage).toBe(1);
    expect(result.current.annotations[0].uuid).toBe('first');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
      await navigation;
    });
    expect(result.current.currentPage).toBe(68);
    expect(result.current.annotations[0].uuid).toBe('last');
    expect(result.current.preparing).toBeNull();
  });

  it('cancels polling when a new search starts', async () => {
    vi.useFakeTimers();
    request.mockResolvedValueOnce(pending(1)).mockResolvedValueOnce(response(1, 'new'));
    const { result, unmount } = renderHook(() => useAnnotationsSearch());
    act(() => result.current.setSearchInput('cod'));
    let old!: Promise<void>;
    await act(async () => {
      old = result.current.submitSearch();
    });
    act(() => result.current.setSearchInput('crab'));
    await act(() => result.current.submitSearch());
    await act(async () => {
      await old;
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(request).toHaveBeenCalledTimes(2);
    expect(result.current.annotations[0].uuid).toBe('new');
    unmount();
  });

  it('ignores late responses from an aborted request', async () => {
    let resolve!: (value: Awaited<ReturnType<typeof sessionRequest>>) => void;
    request.mockImplementationOnce(
      () =>
        new Promise(done => {
          resolve = done;
        })
    );
    const { result } = renderHook(() => useAnnotationsSearch());
    act(() => result.current.setSearchInput('cod'));
    let old!: Promise<void>;
    act(() => {
      old = result.current.submitSearch();
    });
    act(() => result.current.setSearchInput('crab'));
    request.mockResolvedValueOnce(response(1, 'new'));
    await act(() => result.current.submitSearch());
    await act(async () => {
      resolve(response(1, 'old'));
      await old;
    });
    expect(result.current.annotations[0].uuid).toBe('new');
    expect(JSON.parse(sessionStorage.getItem(SEARCH_STORAGE_KEY)!).params.name_part).toBe('crab');
  });

  it('retries failures at the requested page and restarts expired sessions from page one', async () => {
    request.mockResolvedValueOnce(response()).mockRejectedValueOnce(new Error('offline'));
    const { result } = await start();
    await act(() => result.current.goToPage(2));
    expect(result.current.errorAction).toBe('retry');
    expect(result.current.currentPage).toBe(1);
    request.mockResolvedValueOnce(response(2));
    await act(() => result.current.retrySearch());
    expect(result.current.currentPage).toBe(2);
    request.mockRejectedValueOnce({
      response: { status: 410, data: { code: 'search_session_expired' } }
    });
    await act(() => result.current.goToPage(3));
    expect(result.current.errorAction).toBe('restart');
    expect(sessionStorage.getItem(SEARCH_STORAGE_KEY)).toBeNull();
    request.mockResolvedValueOnce(response());
    await act(() => result.current.restartSearch());
    expect(request.mock.calls.at(-1)?.[0].method).toBe('POST');
    expect(result.current.currentPage).toBe(1);
  });

  it('resumes a session from storage after refresh', async () => {
    storeSearch({ version: 1, searchId: id, expiresAt: expires(), params, terms: [] });
    request.mockResolvedValue(response(3));
    const { result } = renderHook(() => useAnnotationsSearch());
    await waitFor(() => expect(result.current.currentPage).toBe(3));
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0].method).toBe('GET');
    expect(result.current.chipLabels).toContain('name part: cod');
    expect(result.current.includeDescendants).toBe(true);
    expect(window.location.search).toContain('name_part=cod');
  });

  it('gives shared URLs precedence and creates a fresh session before jumping pages', async () => {
    storeSearch({ version: 1, searchId: id, expiresAt: expires(), params, terms: [] });
    window.history.replaceState(
      null,
      '',
      '/?search=1&name_part=crab&sources=jncc&page=4&min_lat=10&max_lat=20'
    );
    request.mockResolvedValueOnce(response()).mockResolvedValueOnce(response(4));
    const { result } = renderHook(() => useAnnotationsSearch());
    await waitFor(() => expect(result.current.currentPage).toBe(4));
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      data: { name_part: 'crab', page: 1, sources: ['jncc'], min_lat: 10, max_lat: 20 }
    });
    expect(result.current.additionalFilters).toEqual({ min_lat: 10, max_lat: 20 });
    expect(result.current.selectedSources).toEqual(['jncc']);
  });

  it('shows restart for locally expired sessions without requesting stale pages', async () => {
    storeSearch({ version: 1, searchId: id, expiresAt: '2000-01-01T00:00:00Z', params, terms: [] });
    const { result } = renderHook(() => useAnnotationsSearch());
    await waitFor(() => expect(result.current.errorAction).toBe('restart'));
    expect(request).not.toHaveBeenCalled();
    expect(window.location.search).toContain('name_part=cod');
  });

  it('handles malformed links and unavailable storage without crashing', async () => {
    window.history.replaceState(null, '', '/?search=1&name_part=cod&page=bad');
    sessionStorage.setItem(SEARCH_STORAGE_KEY, '{corrupt');
    const { result } = renderHook(() => useAnnotationsSearch());
    await waitFor(() => expect(result.current.error).toContain('invalid filters'));
    expect(request).not.toHaveBeenCalled();
    const denied = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    request.mockResolvedValue(response());
    act(() => result.current.setSearchInput('cod'));
    await act(() => result.current.submitSearch());
    expect(result.current.annotations).toHaveLength(1);
    denied.mockRestore();
  });

  it('creates new map-area sessions and shares their applied bounds', async () => {
    request.mockResolvedValue(response());
    const { result } = await start();
    act(() => result.current.setSearchInput('unsubmitted draft'));
    await act(() =>
      result.current.searchThisArea({ min_lat: 49, max_lat: 51, min_lon: -5, max_lon: -2 })
    );
    expect(request.mock.calls.at(-1)?.[0]).toMatchObject({
      method: 'POST',
      data: { name_part: 'cod', min_lat: 49 }
    });
    expect(new URL(result.current.shareUrl!).searchParams.get('min_lat')).toBe('49');
    expect(new URL(result.current.shareUrl!).searchParams.get('name_part')).toBe('cod');
  });

  it('restores searches on browser back/forward navigation', async () => {
    request.mockResolvedValue(response());
    const { result } = await start();
    await act(async () => {
      window.history.pushState(null, '', '/?search=1&name_part=crab');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(request.mock.calls.at(-1)?.[0]).toMatchObject({
      method: 'POST',
      data: { name_part: 'crab' }
    });
    expect(result.current.chipLabels).toContain('name part: crab');
  });

  it('copies applied search URLs and offers a manual fallback', async () => {
    request.mockResolvedValue(response());
    const { result } = await start();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    await act(() => result.current.shareResults());
    expect(writeText).toHaveBeenCalledWith(result.current.shareUrl);
    expect(result.current.shareMessage).toContain('copied');
    writeText.mockRejectedValueOnce(new Error('denied'));
    await act(() => result.current.shareResults());
    expect(result.current.shareMessage).toContain('Copy the search link');
  });
});

it('waits and retries when another worker is preparing the session', async () => {
  vi.useFakeTimers();
  request
    .mockResolvedValueOnce(response())
    .mockRejectedValueOnce({
      response: {
        status: 409,
        headers: { 'retry-after': '2' },
        data: { code: 'search_session_busy' }
      }
    })
    .mockResolvedValueOnce(response(2));
  const { result } = await start();
  let navigation!: Promise<void>;
  await act(async () => {
    navigation = result.current.goToPage(2);
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });
  expect(request).toHaveBeenCalledTimes(2);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
    await navigation;
  });
  expect(result.current.currentPage).toBe(2);
});

it('cancels a pending poll when the component unmounts', async () => {
  vi.useFakeTimers();
  request.mockResolvedValue(pending(1));
  const { result, unmount } = renderHook(() => useAnnotationsSearch());
  act(() => result.current.setSearchInput('cod'));
  let search!: Promise<void>;
  await act(async () => {
    search = result.current.submitSearch();
  });
  unmount();
  await search;
  await vi.advanceTimersByTimeAsync(5000);
  expect(request).toHaveBeenCalledTimes(1);
  expect(request.mock.calls[0][0].signal?.aborted).toBe(true);
});

it('handles empty searches and ignores invalid page navigation', async () => {
  const empty = response(1, 'unused', 0);
  if (!('status' in empty.data)) empty.data.results = [];
  request.mockResolvedValue(empty);
  const { result } = await start();
  expect(result.current.totalPages).toBe(0);
  expect(result.current.hasSearched).toBe(true);
  for (const page of [0, 1, 2, -1, 1.5]) await act(() => result.current.goToPage(page));
  expect(request).toHaveBeenCalledTimes(1);
});

it('applies exclusions to the full search, preserves options, and clears them for a new search', async () => {
  const initial = response();
  const info = {
    image_sets: [{ uuid: id, name: 'Survey images' }],
    annotation_sets: [{ uuid: id, name: 'Survey annotations' }],
    aphia_ids: [{ aphia_id: 126436, scientific_name: 'Gadus morhua', rank: 'Species' }]
  };
  if (!('status' in initial.data)) initial.data.meta.info = info;
  request.mockResolvedValueOnce(initial).mockResolvedValue(response(1, 'filtered', 12));
  const { result } = await start();
  act(() => result.current.setSearchInput('unsubmitted draft'));
  await act(() =>
    result.current.applyExcludeFilters({ exclude_image_set: [id], exclude_aphia_ids: [126436] })
  );
  expect(request.mock.calls.at(-1)?.[0]).toMatchObject({
    method: 'POST',
    data: { page: 1, name_part: 'cod', exclude_image_set: [id], exclude_aphia_ids: [126436] }
  });
  expect(result.current.count).toBe(12);
  expect(result.current.info).toEqual(info);
  expect(result.current.shareUrl).toContain('exclude_aphia_ids=126436');
  await act(() =>
    result.current.applyExcludeFilters({ exclude_image_set: [], exclude_aphia_ids: [] })
  );
  expect(request.mock.calls.at(-1)?.[0].data).not.toHaveProperty('exclude_image_set');
  expect(result.current.info).toEqual(info);
  await act(() => result.current.submitSearch());
  expect(result.current.info).toBeNull();
  expect(result.current.excludeFilters.exclude_aphia_ids).toBeUndefined();
});

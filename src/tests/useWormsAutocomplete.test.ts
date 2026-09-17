/** @vitest-environment jsdom */
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { apiRequest } from '../api/apiClient';
import { useWormsAutocomplete } from '../hooks/useWormsAutocomplete';

vi.mock('../api/apiClient', () => ({ apiRequest: vi.fn() }));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

it('reads the taxonomy collection and distinguishes no matches from failure', async () => {
  const request = vi.mocked(apiRequest);
  request.mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });
  const { result, rerender } = renderHook(({ term }) => useWormsAutocomplete(term), {
    initialProps: { term: 'cod' }
  });
  await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
  expect(result.current.wormsOptions).toEqual([]);
  expect(result.current.wormsError).toBeNull();
  request.mockRejectedValueOnce({ response: { status: 502, data: { code: 'upstream_failed' } } });
  rerender({ term: 'crab' });
  await waitFor(() => expect(result.current.wormsError).toContain('unavailable'));
  expect(result.current.wormsLoading).toBe(false);
  rerender({ term: '' });
  await waitFor(() => expect(result.current.wormsError).toBeNull());
});

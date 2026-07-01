/**
 * @vitest-environment jsdom
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { afterEach, describe, expect, it } from 'vitest';

import { apiClient } from '../api/apiClient'
import { useApiRequest } from '../hooks/useApiRequest';

const mock = new MockAdapter(apiClient);

afterEach(() => {
  mock.reset();
});

describe('useApiRequest', () => {
  it('starts in idle state with no data and no error', () => {
    const { result } = renderHook(() => useApiRequest());

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets status to loading immediately after makeRequest is called', () => {
    mock.onGet('/sources').reply(200, { sources: [{ source_name: 'bodc' }] });

    const { result } = renderHook(() => useApiRequest<{ sources: unknown[] }>());

    act(() => {
      result.current.makeRequest({ method: 'GET', url: '/sources' });
    });

    expect(result.current.status).toBe('loading');
    expect(result.current.error).toBeNull();
  });

  it('transitions to success with data when the response is non-empty', async () => {
    mock.onGet('/sources').reply(200, {
      sources: [{ source_name: 'bodc' }, { source_name: 'jncc' }],
    });

    const { result } = renderHook(() => useApiRequest<{ sources: unknown[] }>());

    act(() => {
      result.current.makeRequest({ method: 'GET', url: '/sources' });
    });

    await waitFor(() => expect(result.current.status).toBe('success'));

    expect(result.current.data?.sources).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('transitions to empty when the response array is empty', async () => {
    mock.onGet('/sources').reply(200, { sources: [] });

    const { result } = renderHook(() => useApiRequest<{ sources: unknown[] }>());

    act(() => {
      result.current.makeRequest({ method: 'GET', url: '/sources' });
    });

    await waitFor(() => expect(result.current.status).toBe('empty'));

    expect(result.current.data?.sources).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it('transitions to empty when the response has count: 0', async () => {
    mock.onGet('/annotations').reply(200, { count: 0, results: [] });

    const { result } = renderHook(() => useApiRequest<{ count: number }>());

    act(() => {
      result.current.makeRequest({ method: 'GET', url: '/annotations' });
    });

    await waitFor(() => expect(result.current.status).toBe('empty'));
  });

  it('test status validation error on a 422 response', async () => {
    mock.onGet('/sources').reply(422);

    const { result } = renderHook(() => useApiRequest());

    act(() => {
      result.current.makeRequest({ method: 'GET', url: '/sources' });
    });

    await waitFor(() => expect(result.current.status).toBe('validationError'));

    expect(result.current.error).toBe('Invalid request parameters.');
  });

  it('test status serverError on a 500 response', async () => {
    mock.onGet('/sources').reply(500);

    const { result } = renderHook(() => useApiRequest());

    act(() => {
      result.current.makeRequest({ method: 'GET', url: '/sources' });
    });

    await waitFor(() => expect(result.current.status).toBe('serverError'));

    expect(result.current.error).toBe('Something went wrong. Please try again later.');
  });

});

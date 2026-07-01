import MockAdapter from 'axios-mock-adapter';
import { afterEach, describe, expect, it } from 'vitest';

import { apiClient, apiRequest } from './../app/api/apiClient';

const mock = new MockAdapter(apiClient);

afterEach(() => {
  mock.reset();
});

describe('apiRequest', () => {
  it('returns response data on a successful GET request', async () => {
    mock.onGet('/sources').reply(200, { sources: [{ source_name: 'bodc' }, { source_name: 'jncc' }] });

    const result = await apiRequest<{ sources: unknown[] }>({
      method: 'GET',
      url: '/sources',
    });

    expect(result.sources).toHaveLength(2);
    expect(result.sources[0]).toEqual({ source_name: 'bodc' });
    expect(result.sources[1]).toEqual({ source_name: 'jncc' });
  });

  it('sends query params correctly, including repeated array values', async () => {
    mock.onGet('/taxa/ajax_by_name_part/crab').reply((config) => {
      expect(config.params).toEqual({
        sources: ['bodc', 'jncc'],
        combine_vernaculars: true,
      });
      return [200, { result: [{ source: { name: 'bodc', ok: true, data: [] } }] }];
    });

    await apiRequest({
      method: 'GET',
      url: '/taxa/ajax_by_name_part/crab',
      queryParams: { sources: ['bodc', 'jncc'], combine_vernaculars: true },
    });
  });

  it('sends a request body for POST requests', async () => {
    mock.onPost('/annotations').reply((config) => {
      expect(JSON.parse(config.data)).toEqual({ title: 'New annotation' });
      return [201, { id: 1 }];
    });

    const result = await apiRequest<{ id: number }>({
      method: 'POST',
      url: '/annotations',
      data: { title: 'New annotation' },
    });

    expect(result.id).toBe(1);
  });

  it('throws on a server error response', async () => {
    mock.onGet('/sources').reply(500);

    await expect(
      apiRequest({ method: 'GET', url: '/sources' })
    ).rejects.toMatchObject({ response: { status: 500 } });
  });

  it('throws on a validation error response', async () => {
    mock.onGet('/sources').reply(422, { message: 'Invalid query' });

    await expect(
      apiRequest({ method: 'GET', url: '/sources' })
    ).rejects.toMatchObject({ response: { status: 422 } });
  });
});

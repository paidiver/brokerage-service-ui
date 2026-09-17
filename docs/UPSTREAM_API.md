## Making API Calls

All API calls must go through the `apiRequest()` function in [apiClient.ts](/src/app/api/apiClient.ts), rather than calling `fetch` or `axios` directly. `apiRequest()` wraps a shared axios instance configured with the correct base URL, so using it consistently ensures every request goes to the right environment without needing to handle the base URL yourself.

**Example:**

```ts
import { apiRequest } from '../../api/apiClient';
import { SourcesInfoResponse } from '../../types/responseModels';

const sourceInfo = async () =>
  await apiRequest<SourcesInfoResponse>({
    method: 'GET',
    url: '/sources'
  });

console.log('sourceInfo', sourceInfo);
```

The example above calls the `/sources` endpoint, which returns the health status of all configured sources. `apiRequest()` is generic, so pass the response interface as the type argument (e.g. `apiRequest<SourcesInfoResponse>`) and it will be typed accordingly.

The API base URL is controlled by the `NEXT_PUBLIC_BROKERAGE_SERVICE_API` environment variable, set at build time.

### Response Types

Response shapes are defined as interfaces in [apiResponseTypes.ts](/src/types/apiResponseTypes.ts).

When adding a new endpoint:

1. Create an entity-specific interface in `/src/models/{entity_name}.ts` (e.g. `images.ts` for an image entity).
2. Add a corresponding response wrapper interface in [apiResponseTypes.ts](/src/types/apiResponseTypes.ts) that describes the shape actually returned by the endpoint.

For example, for an endpoint returning a list of images: define the `Image` interface in `models/images.ts`, then add an `ImagesResponse` interface in `responseModels.ts` that wraps it (e.g. as an array or with pagination metadata, depending on the endpoint).

### Parameters for `apiRequest()`

`apiRequest()` accepts the following options:

| Parameter      | Required                                  | Description                                                                                |
| -------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| `method`       | Yes                                       | HTTP method: `'GET'`, `'POST'`, `'PUT'`, `'PATCH'`, or `'DELETE'`.                         |
| `url`          | Yes                                       | The endpoint path, relative to the configured base URL (e.g. `/sources`).                  |
| `data`         | Only for `POST`, `PUT`, `PATCH`, `DELETE` | The request body to send.                                                                  |
| `queryParams`  | No                                        | An object of key/value pairs sent as URL query parameters (e.g. `{ page: 1, limit: 20 }`). |
| `responseType` | No                                        | Expected response format: `'json'` (default), `'blob'`, `'arraybuffer'`, or `'text'`.      |

**Example with query parameters and a typed response:**

```ts
const results = await apiRequest<TaxaBulkResponse>({
  method: 'GET',
  url: '/taxonomy/worms/taxa/crab',
  queryParams: {
    sources: 'bodc',
    combine_vernaculars: true
  }
});
```

**Example with a request body:**

```ts
await apiRequest<AnnotationsSubmissionResponse>({
  method: 'POST',
  url: '/annotations',
  data: { title: 'New annotations' }
});
```

### Using the `useApiRequest` Hook (Recommended for Components)

While `apiRequest()` is the underlying function that performs the HTTP call, most components should use the `useApiRequest()` hook instead. It wraps `apiRequest()` and manages loading, success, empty, validation error, and server error states automatically, so components don't need to manage this state manually with `useState`/`useEffect`.

**Basic usage:**

```tsx
'use client';
import { useApiRequest } from '../../hooks/useApiRequest';
import { SourcesInfoResponse } from '../../types/apiResponseTypes.ts';

export default function SourcesList() {
  const { data, status, error, makeRequest } = useApiRequest<SourcesInfoResponse>();

  const fetchSources = () => {
    makeRequest({
      method: 'GET',
      url: '/sources'
    });
  };

  return (
    <div>
      <button onClick={fetchSources}>Load Sources</button>

      {status === 'loading' && <p>Loading...</p>}
      {status === 'empty' && <p>No sources found.</p>}
      {status === 'validationError' && <p>Error: {error}</p>}
      {status === 'serverError' && <p>Error: {error}</p>}
      {status === 'success' && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

**What the hook returns:**

| Property      | Description                                                                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`        | The response data, or `null` if not yet loaded or on error.                                                                                                                  |
| `status`      | One of `'idle'`, `'loading'`, `'success'`, `'empty'`, `'validationError'`, `'serverError'`.                                                                                  |
| `error`       | A human-readable error message, or `null` if no error.                                                                                                                       |
| `makeRequest` | Function to trigger the request. Accepts the same options as `apiRequest()` (`method`, `url`, `queryParams`, `data`, etc.), plus an optional `isEmpty` override (see below). |

**Detecting empty responses:**

The hook automatically checks common response shapes (a top-level array, a `results` array, or a `count` of `0`) to determine the `empty` status. For response shapes that don't match these patterns, pass a custom `isEmpty` function:

```tsx
makeRequest({
  method: 'GET',
  url: '/taxonomy/worms/taxa/crab',
  queryParams: { sources: ['bodc', 'jncc'] },
  isEmpty: data => !data.ok || !data.data || data.data.length === 0
});
```

**Running a request on page load:**

To fetch data automatically when a component mounts, call `makeRequest` inside a `useEffect`:

```tsx
useEffect(() => {
  makeRequest({ method: 'GET', url: '/sources' });
}, [makeRequest]);
```

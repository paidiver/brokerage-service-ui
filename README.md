# Brokerage Service UI

Brokerage Service UI provides a web interface for interating with the brokerage service API.

The application is implemented using Next.js and React.

The application is available at this link on GitHub Pages: [https://paidiver.github.io/brokerage-service-ui/](https://paidiver.github.io/brokerage-service-ui/)

## Requirements

### Runtime

- Node.js
- npm or yarn

### Local development

To run the full application locally against local services, you will also need:

- Docker and Docker Compose
- a local instance of the **Brokerage Service API**: please see the [`brokerage-service-api` repository](https://github.com/paidiver/brokerage-service-api) for setup instructions

### Making API Calls

All API calls must go through the `apiRequest()` function in [apiClient.ts](/src/app/api/apiClient.ts), rather than calling `fetch` or `axios` directly. `apiRequest()` wraps a shared axios instance configured with the correct base URL, so using it consistently ensures every request goes to the right environment without needing to handle the base URL yourself.

**Example:**

```ts
import { apiRequest } from '../api/apiClient'
import { SourcesInfoResponse } from '../models/responseModels'

const sourceInfo = async () => await apiRequest<SourcesInfoResponse>({
  method: 'GET',
  url: '/sources'
});

console.log('sourceInfo', sourceInfo);
```

The example above calls the `/sources` endpoint, which returns the health status of all configured sources. `apiRequest()` is generic, so pass the response interface as the type argument (e.g. `apiRequest<SourcesInfoResponse>`) and it will be typed accordingly.

The API base URL is controlled by the `NEXT_PUBLIC_BROKERAGE_SERVICE_API` environment variable, set at build time.

### Response Types

Response shapes are defined as interfaces in [responseModels.ts](/src/app/models/responseModels.ts).

When adding a new endpoint:
1. Create an entity-specific interface in `/src/app/models/{entity_name}.ts` (e.g. `images.ts` for an image entity).
2. Add a corresponding response wrapper interface in [responseModels.ts](/src/app/models/responseModels.ts) that describes the shape actually returned by the endpoint.

For example, for an endpoint returning a list of images: define the `Image` interface in `models/images.ts`, then add an `ImagesResponse` interface in `responseModels.ts` that wraps it (e.g. as an array or with pagination metadata, depending on the endpoint).

### Parameters for `apiRequest()`

`apiRequest()` accepts the following options:

| Parameter | Required | Description |
|---|---|---|
| `method` | Yes | HTTP method: `'GET'`, `'POST'`, `'PUT'`, `'PATCH'`, or `'DELETE'`. |
| `url` | Yes | The endpoint path, relative to the configured base URL (e.g. `/sources`). |
| `data` | Only for `POST`, `PUT`, `PATCH`, `DELETE` | The request body to send. |
| `queryParams` | No | An object of key/value pairs sent as URL query parameters (e.g. `{ page: 1, limit: 20 }`). |
| `responseType` | No | Expected response format: `'json'` (default), `'blob'`, `'arraybuffer'`, or `'text'`. |

**Example with query parameters and a typed response:**

```ts
const results = await apiRequest<SearchResponse>({
  method: 'GET',
  url: '/taxa/ajax_by_name_part/crab',
  queryParams: {
      sources: 'bodc',
      combine_vernaculars: true
    }
});
```

**Example with a request body:**

```ts
await apiRequest<AnnotaionsSubmissionResponse>({
  method: 'POST',
  url: '/annotations',
  data: { title: 'New annotations' }
});
```

## Deployment

Deployment is handled automatically using a GitHub Actions workflow that runs on every push to the `main` branch.
The built site will be published to `https://paidiver.github.io/brokerage-service-ui/`

Because this site is deployed as a static brokerage-service-ui on GitHub Pages:

- it can only interact with backend services that are publicly reachable from the browser

**Required Cnfiguration:**
- Repository Variable `NEXT_PUBLIC_BROKERAGE_SERVICE_API` : The base url for backend API (e.g. `https://brokerage-service.paidiver.site`)

## Smoke checks after deployment

1. Open `https://paidiver.github.io/brokerage-service-ui/` — the app should load.
2. Open browser DevTools → Network, trigger an API-dependent action,
   confirm requests go to the configured API base URL and return 2xx.

## Quick Start

### 1. Create environment file

Configuration is provided via environment variables defined in `.env`.

Start from the example file:

```bash
cp .env.example .env
```

Example contents:

```bash
NEXT_PUBLIC_BROKERAGE_SERVICE_API=https://brokerage-service.paidiver.site
```

You can adjust these values as needed to point to your local or remote services.

## 2. Install dependencies

Using npm:

```bash
npm install
```

## 3. Run the brokerage-service-ui

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Acknowledgements

This project was supported by the UK Natural Environment Research Council (NERC) through the _Tools for automating image analysis for biodiversity monitoring (AIAB)_ Funding Opportunity, reference code **UKRI052**.

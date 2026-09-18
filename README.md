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

## Quick Start

### 1. Create environment file

Configuration is provided via environment variables defined in `.env`.

Start from the example file:

```bash
cp .env.example .env
```

Example contents:

```bash
NEXT_PUBLIC_BROKERAGE_SERVICE_API=https://paidiver-brokerage-service.noc.ac.uk
# Optional MapLibre style URL; defaults to OpenFreeMap Liberty.
NEXT_PUBLIC_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
```

You can adjust these values as needed to point to your local or remote services.

### 2. Install dependencies

Using npm:

```bash
npm install
```

### 3. Run the brokerage-service-ui

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

### 4. Run tests

Unit tests are written using [Vitest](https://vitest.dev/) with the following libraries:

- **`@testing-library/react`** — renders React hooks in a test environment
- **`axios-mock-adapter`** — intercepts and mocks HTTP requests made via axios, without hitting a real backend

#### Test structure

Tests are co-located with the source files they cover:

```
src/
  app/
    api/
      apiClient.ts
  hooks/
    useApiRequest.ts
  tests/
    apiClient.test.ts         ← tests for apiRequest()
    useApiRequest.test.ts     ← tests for the useApiRequest hook

```

#### Running tests

Run all tests:

```bash
npm run test
```

## Making API Calls

For more information on the integration with the brokerage service API, please refer to the ["apiRequest function documentation"](docs/UPSTREAM_API.md).

## Acknowledgements

This project was supported by the UK Natural Environment Research Council (NERC) through the _Tools for automating image analysis for biodiversity monitoring (AIAB)_ Funding Opportunity, reference code **UKRI052**.

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

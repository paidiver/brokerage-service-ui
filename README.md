# Imagery Search Frontend

Imagery Search Frontend provides a simple web interface for searching imagery submissions and annotation data across BODC services.

The application is implemented using Next.js and React, and integrates with:

- the Datasubs / Submission API for imagery submission metadata
- the Annotations API for grouped annotation search results
- a WoRMS cache API for taxonomic autocomplete in the annotations search

The application is available at this link on GitHub Pages: [https://paidiver.github.io/imagery-metadata-search/](https://paidiver.github.io/imagery-metadata-search/)

## Overview

This application exposes two main user-facing search workflows:

- **Imagery search (`/`)**: browse and search imagery submissions by dataset title
- **Annotations search (`/annotations`)**: search annotation records by taxonomic name or WoRMS/Aphia match, with optional inclusion of descendant taxa

## Requirements

### Runtime

- Node.js
- npm or yarn

### Local development

To run the full application locally against local services, you will also need:

- Docker and Docker Compose
- a local instance of the **Annotations API**: please see the [`annotations-api` repository](https://github.com/paidiver/annotations-api) for setup instructions
- a local instance of the **WoRMS cache API**: please see the [`worms-cache` repository](https://github.com/paidiver/worms-cache) for setup instructions
- optionally, access to a local or remote **Submission API**

## Deployment

Deployment is handled automatically using a GitHub Actions workflow that runs on every push to the `main` branch.

Because this site is deployed as a static frontend on GitHub Pages:

- it can only interact with backend services that are publicly reachable from the browser
- the imagery search works in production because it uses a publicly accessible Submission API
- the annotations search does not yet work in production because the Annotations API is not currently exposed publicly

Once the Annotations API is deployed as a public-facing service, the annotations search page on GitHub Pages will also work in production.

## Quick Start

### 1. Create environment file

Configuration is provided via environment variables defined in `.env`.

Start from the example file:

```bash
cp .env.example .env
```

Example contents:

```bash
NEXT_PUBLIC_SUBMISSION_API=https://submit-data.bodc.ac.uk
NEXT_PUBLIC_ANNOTATIONS_API=http://localhost:8000
NEXT_PUBLIC_WORMS_API=http://localhost:8001
```

You can adjust these values as needed to point to your local or remote services.

## 2. Install dependencies

Using npm:

```bash
npm install
```

## 3. Run the frontend

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Features

### Imagery search

The home page (`/`) allows users to:

- list imagery submissions
- search submissions by dataset title
- paginate through results
- open a detailed view for an individual submission

This page uses the Submission API endpoint:

- `imagery-submissions`

and filters results to:

- `submission_type=imagery`

### Annotations search

The annotations page (`/annotations`) allows users to:

- search annotations by free-text taxon name
- search annotations using WoRMS-backed autocomplete suggestions
- optionally include descendant taxa in the search
- view grouped annotation results
- see a result count and summary
- load additional pages of grouped results

The page uses:

- the Annotations API for grouped annotation search
- the WoRMS cache API for autocomplete suggestions

## Acknowledgements

This project was supported by the UK Natural Environment Research Council (NERC) through the _Tools for automating image analysis for biodiversity monitoring (AIAB)_ Funding Opportunity, reference code **UKRI052**.

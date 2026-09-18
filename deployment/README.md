# PAIDIVER Brokerage Service UI deployment

The live UI is packaged as a standalone Next.js server and deployed with Helmfile. Development deployments are intentionally not included: pushes to `main` are exported and deployed to GitHub Pages by `.github/workflows/nextjs.yml`.

## Release flow

- Pull requests build the server image and lint the Helm chart.
- Pushes to `main` deploy the static export to GitHub Pages.
- A `vMAJOR.MINOR.PATCH` tag publishes the matching GHCR image and Helm chart release.
- A `docker-vMAJOR.MINOR.PATCH` tag publishes both artifacts using the API repository's manual-tag convention.

The API URL is runtime-configurable. Helm sets `env.brokerageServiceApiUrl`, and the container publishes it to the browser through `/runtime-config.js` when the pod starts. Changing the URL does not require rebuilding the image.

The map style remains a Docker build argument named `NEXT_PUBLIC_MAP_STYLE_URL`.

## Live deployment

Run commands from `deployment/helmfile`.

```bash
cp .env.example .env
set -a
source .env
set +a

helmfile -e live diff
helmfile -e live apply
```

Set `IMAGE_TAG` to deploy a particular released image; it defaults to `latest`.

```bash
export IMAGE_TAG=1.2.3
helmfile -e live apply
```

Set the live API URL in `helmfile/env/live/values.yaml`:

```yaml
env:
  brokerageServiceApiUrl: https://brokerage-service-api.paidiver.site
```

For a one-off override:

```bash
helmfile -e live apply --set env.brokerageServiceApiUrl=https://api.example.org
```

For GitHub Pages, edit the workflow-level value near the top of `.github/workflows/nextjs.yml`:

```yaml
env:
  NEXT_PUBLIC_BROKERAGE_SERVICE_API: https://brokerage-service-api.paidiver.site
```

The Pages workflow uses this value to generate `runtime-config.js` before building the static site.

The presync hook ensures the namespace, GHCR pull secret, and Let's Encrypt ClusterIssuer exist. The required tools are `kubectl`, Helm, Helmfile, and the `helm-diff` plugin.

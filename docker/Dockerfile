FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG NEXT_PUBLIC_BROKERAGE_SERVICE_API=https://brokerage-service-api.paidiver.site
ARG NEXT_PUBLIC_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
ENV NEXT_PUBLIC_BROKERAGE_SERVICE_API=${NEXT_PUBLIC_BROKERAGE_SERVICE_API} \
    NEXT_PUBLIC_MAP_STYLE_URL=${NEXT_PUBLIC_MAP_STYLE_URL} \
    STATIC_EXPORT=false
RUN npm run build

FROM node:20-alpine AS runtime
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    NEXT_PUBLIC_BROKERAGE_SERVICE_API=https://brokerage-service-api.paidiver.site
WORKDIR /app
RUN chown node:node /app
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --chown=node:node --chmod=755 docker/entrypoint.sh /app/entrypoint.sh
USER node
EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]

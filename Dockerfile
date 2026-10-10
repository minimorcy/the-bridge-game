FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY scripts/ensure-native-bindings.mjs scripts/
# Reintentos ante cortes de red del registro npm y caché de descargas entre builds
ENV NPM_CONFIG_FETCH_RETRIES=5 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund && node scripts/ensure-native-bindings.mjs
COPY . .
# Umami (opcional): Vite las incrusta en el build, por eso son ARG y no variables de ejecución
ARG VITE_UMAMI_SCRIPT_URL
ARG VITE_UMAMI_WEBSITE_ID
ARG VITE_UMAMI_DOMAINS
RUN npm test && npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

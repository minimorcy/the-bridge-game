FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY scripts/ensure-native-bindings.mjs scripts/
RUN npm ci --no-audit --no-fund && node scripts/ensure-native-bindings.mjs
COPY . .
RUN npm test && npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

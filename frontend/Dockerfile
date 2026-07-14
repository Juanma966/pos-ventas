# Frontend POS — build con Vite, servido por nginx
FROM node:20-alpine AS build

WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# En producción la API va por el mismo origen (nginx hace proxy de /api al backend).
ARG VITE_API_URL=/api
# .env.production tiene prioridad sobre .env en el build de Vite (mode=production).
RUN printf 'VITE_API_URL=%s\nVITE_APP_BASE_NAME=/\nVITE_APP_VERSION=v4.0.0\nGENERATE_SOURCEMAP=false\n' "$VITE_API_URL" > .env.production
RUN pnpm build

# --- Etapa de servido ---
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

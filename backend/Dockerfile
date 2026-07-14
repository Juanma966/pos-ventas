# Backend POS — Node + Express + Prisma
FROM node:20-alpine

WORKDIR /app

# pnpm vía corepack (el proyecto usa pnpm, no npm).
# La versión la fija el campo "packageManager" del package.json.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# Instala dependencias (incluye prisma CLI para generate + migrate deploy).
# NODE_ENV se define en runtime (compose), no acá, para no omitir devDependencies.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Cliente de Prisma (pnpm no corre el postinstall por defecto)
COPY prisma ./prisma
RUN pnpm prisma generate

# Código de la aplicación
COPY src ./src

EXPOSE 4000

# Aplica migraciones pendientes y arranca el servidor.
CMD ["sh", "-c", "pnpm prisma migrate deploy && node src/server.js"]

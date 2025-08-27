# Stage 1 - Build
FROM node:20-alpine AS base

# Instalar pnpm
RUN npm install -g pnpm@10.15.0

# Definir diretório de trabalho
WORKDIR /app

# Copiar manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/frontend/package.json ./apps/frontend/

# Instalar dependências (monorepo completo)
RUN pnpm install --frozen-lockfile

# Copiar código
COPY . .

# Build do frontend
RUN pnpm --filter frontend build

# Stage 2 - Production
FROM node:20-alpine AS production

WORKDIR /app

# Copiar apenas o que o frontend precisa
COPY --from=base /app/apps/frontend/.next ./.next
COPY --from=base /app/apps/frontend/public ./public
COPY --from=base /app/apps/frontend/package.json ./package.json
COPY --from=base /app/apps/frontend/next.config.ts ./next.config.ts

# Instalar apenas dependências de produção do frontend
RUN npm install -g pnpm@10.15.0 && pnpm install --filter frontend --prod

# Expor porta
EXPOSE 3001

# Rodar usando o script do package.json
CMD ["pnpm", "start"]
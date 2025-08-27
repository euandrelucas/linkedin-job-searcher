# Stage 1 - Build
FROM node:20-alpine AS base

# Instalar pnpm
RUN npm install -g pnpm@10.15.0

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos principais
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/

# Instalar dependências (monorepo inteiro)
RUN pnpm install --frozen-lockfile

# Copiar código
COPY . .

# Build do backend
RUN pnpm --filter backend build

# Stage 2 - Production
FROM node:20-alpine AS production

WORKDIR /app

# Copiar build e package.json do backend
COPY --from=base /app/apps/backend/dist ./dist
COPY --from=base /app/apps/backend/package.json ./package.json

# Instalar apenas dependências de produção do backend
RUN npm install -g pnpm@10.15.0 && pnpm install --filter backend --prod

# Expor porta
EXPOSE 3000

# Rodar NestJS
CMD ["node", "dist/main"]

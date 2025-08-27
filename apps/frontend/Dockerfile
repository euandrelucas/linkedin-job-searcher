FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.15.0

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application (excluding node_modules due to .dockerignore)
COPY . .

# Build the application
RUN pnpm --filter frontend build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built application from base stage
COPY --from=base /app/apps/frontend/.next ./.next
COPY --from=base /app/apps/frontend/public ./public
COPY --from=base /app/apps/frontend/package.json ./
COPY --from=base /app/apps/frontend/next.config.ts ./
COPY --from=base /app/node_modules ./node_modules

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD ["pnpm", "start"]

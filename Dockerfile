# ==============================================================================
# Multi-Stage Docker Build for Acowale Pulse CRM
# Compiles React Frontend and Express TypeScript Backend into a single lightweight image
# ==============================================================================

# Stage 1: Build Client Frontend
FROM node:22-alpine AS build-client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build Server Backend & Prisma
FROM node:22-alpine AS build-server
WORKDIR /app/server
ENV DATABASE_URL="file:./prod.db"
COPY server/package*.json ./
COPY server/prisma ./prisma
RUN npm ci
RUN npx prisma generate
COPY server/ ./
RUN npm run build

# Stage 3: Production Release Image
FROM node:22-alpine AS production
WORKDIR /app/server
ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL="file:./prod.db"

# Install dependencies for Prisma CLI and TSX seeding
COPY server/package*.json ./
COPY server/prisma ./prisma
RUN npm ci
RUN npx prisma generate

# Copy built artifacts from stage 1 and 2
COPY --from=build-server /app/server/dist ./dist
COPY --from=build-client /app/client/dist ../client/dist

# Expose HTTP API & static server port
EXPOSE 5000

# Push schema and seed production DB on startup, then start server
CMD npx prisma db push --force-reset && npx tsx prisma/seed.ts && node dist/server.js

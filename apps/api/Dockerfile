# NestJS API Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies needed for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
# Using npm install instead of npm ci to allow new packages to be added
# In production, ensure package-lock.json is updated and use npm ci
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache openssl

# Copy dependencies and Prisma Client from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install runtime dependencies (including postgresql-client for pg_isready)
RUN apk add --no-cache openssl postgresql-client

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/tsconfig.json ./

# Copy entrypoint script (must be before USER switch)
COPY --from=builder /app/entrypoint.sh ./

# Set correct permissions
RUN chown -R nestjs:nodejs /app && chmod +x entrypoint.sh

USER nestjs

EXPOSE 4000

ENV PORT=4000

# Use entrypoint script for initialization
ENTRYPOINT ["./entrypoint.sh"]

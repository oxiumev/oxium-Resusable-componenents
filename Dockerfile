# ---------------------------------------
# Stage 1: Base (Shared)
# ---------------------------------------
FROM node:20-alpine AS base
WORKDIR /app
# Fontconfig + font for sharp SVG text watermark (e.g. in Docker)
RUN apk add --no-cache fontconfig ttf-dejavu
COPY package*.json ./

# ---------------------------------------
# Stage 2: Development (Hot Reload)
# ---------------------------------------
FROM base AS development
# Install ALL dependencies (including devDependencies like pino-pretty)
RUN npm ci
COPY . .
CMD ["npm", "run", "dev:docker"] 

# ---------------------------------------
# Stage 3: Builder (Compiles for Prod)
# ---------------------------------------
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

# ---------------------------------------
# Stage 4: Production (Optimized)
# ---------------------------------------
FROM node:20-alpine AS production
WORKDIR /app
# Fontconfig + font for sharp SVG text watermark
RUN apk add --no-cache fontconfig ttf-dejavu
COPY package*.json ./
# Install ONLY production dependencies
RUN npm ci --omit=dev
# Copy compiled code from builder
COPY --from=builder /app/build ./build

EXPOSE 4000

CMD ["node", "build/server.js"]
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install adapter-node for production builds
COPY package.json package-lock.json ./
RUN npm ci
RUN npm install -D @sveltejs/adapter-node

# Copy source
COPY . .

# Override adapter-auto → adapter-node for production
RUN sed -i "s|@sveltejs/adapter-auto|@sveltejs/adapter-node|g" svelte.config.js

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy built assets and production deps
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules

# Use non-root user
USER appuser

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "build"]

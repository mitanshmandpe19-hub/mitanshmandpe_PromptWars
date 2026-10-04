# Multi-stage Dockerfile for Blind Spot (Node.js Express + Frontend Client)

# Stage 1: Client Build
FROM node:20-alpine AS client-builder
WORKDIR /app/client

# Copy client source files if present
COPY client/package*.json ./
RUN if [ -f package.json ]; then npm ci; fi
COPY client/ ./
RUN if [ -f package.json ]; then npm run build; else mkdir -p dist; fi

# Stage 2: Production Server Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Install server dependencies
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy server code
COPY server/ ./server/

# Copy built frontend assets from client-builder stage
COPY --from=client-builder /app/client/dist ./client/dist

# Security: run as non-root user
USER node

# Expose default Cloud Run port
EXPOSE 8080

# Start server
CMD ["node", "server/src/index.js"]

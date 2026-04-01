# Stage 1: Build Image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy specifically the dependency files to leverage layer caching
COPY package.json package-lock.json* ./
RUN npm install

# Copy all source code
COPY . .

# Run the project build script (builds client and server to /dist)
RUN npm run build

# Stage 2: Production Image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# DEFAULT PORT for Cloud Run is 8080
ENV PORT=8080

# Copy necessary files for production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies
# Connect-pg-simple and others in the allowlist from build.ts should be here
RUN npm install --omit=dev

# Inform Docker about the intended port
EXPOSE 8080

# Start the production server
CMD ["node", "dist/index.cjs"]

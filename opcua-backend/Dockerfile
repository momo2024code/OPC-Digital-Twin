# Use Node.js LTS Alpine image for smaller size
FROM node:18-alpine

# Create and set working directory
WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Install curl for health checks (Alpine specific)
RUN apk --no-cache add curl

# Health check (uses your /api/health endpoint)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Expose the application port
EXPOSE 3000

# Run as non-root user for security
RUN chown -R node:node /app
USER node

# Start command
CMD ["node", "index.js"]
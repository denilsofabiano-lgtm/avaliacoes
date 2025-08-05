# ==================================
# Frontend Angular Production Build
# ==================================

# Stage 1: Build Angular app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY sistema-avaliacoes/package*.json ./

# Install dependencies
RUN npm ci --only=production --no-audit

# Copy source code
COPY sistema-avaliacoes/ ./

# Build for production
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY docker/nginx/frontend.conf /etc/nginx/conf.d/

# Copy built app from builder stage
COPY --from=builder /app/dist/sistema-avaliacoes /usr/share/nginx/html

# Copy custom nginx.conf if needed
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

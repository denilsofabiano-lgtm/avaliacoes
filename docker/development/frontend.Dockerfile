# ==================================
# Frontend Angular Development Build
# ==================================

FROM node:20-alpine

WORKDIR /app

# Install global dependencies
RUN npm install -g @angular/cli

# Copy package files
COPY sistema-avaliacoes/package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY sistema-avaliacoes/ ./

# Expose port
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4200/ || exit 1

# Start development server
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "4200"]

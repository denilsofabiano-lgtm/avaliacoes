# Build stage
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application for production
RUN npm run build --prod

# Production stage
FROM nginx:alpine

# Copy built application from build stage
COPY --from=build /app/dist/sistema-avaliacoes /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

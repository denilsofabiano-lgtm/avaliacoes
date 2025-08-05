# ==================================
# Backend Symfony API Development Build
# ==================================

FROM php:8.2-cli-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    sqlite \
    sqlite-dev

# Install PHP extensions
RUN docker-php-ext-install \
    pdo_sqlite \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application code first
COPY sistema-avaliacoes-api/ ./

# Create required directories
RUN mkdir -p var/cache var/log config/jwt

# Set permissions
RUN chmod -R 777 var/ config/

# Install dependencies with dev packages
RUN composer install --no-scripts

# Run composer scripts after installation
RUN composer run-script post-install-cmd || true

# Generate JWT keys
RUN php bin/console lexik:jwt:generate-keypair --skip-if-exists || true

# Run database setup
RUN php bin/console doctrine:migrations:migrate --no-interaction || true
RUN php bin/console doctrine:fixtures:load --no-interaction || true

# Expose port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8081/api/doc || exit 1

# Start PHP built-in server
CMD ["php", "-S", "0.0.0.0:8081", "-t", "public"]

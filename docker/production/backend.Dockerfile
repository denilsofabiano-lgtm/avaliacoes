# ==================================
# Backend Symfony API Production Build
# ==================================

FROM php:8.2-fpm-alpine

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

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application code
COPY sistema-avaliacoes-api/ ./

# Create required directories and set permissions
RUN mkdir -p var/cache var/log config/jwt \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/var \
    && chown -R www-data:www-data var/ config/jwt/

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-dev --no-scripts

# Run post-install scripts
RUN composer run-script post-install-cmd || true

# Generate JWT keys
RUN php bin/console lexik:jwt:generate-keypair --skip-if-exists || true

# Run database migrations
RUN php bin/console doctrine:migrations:migrate --no-interaction || true

# Load fixtures (if needed)
RUN php bin/console doctrine:fixtures:load --no-interaction || true

# Optimize for production
RUN composer dump-autoload --optimize --classmap-authoritative

# Expose port for PHP-FPM
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD php-fpm -t || exit 1

# Start PHP-FPM
CMD ["php-fpm"]

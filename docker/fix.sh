#!/bin/bash

# ===================================
# Sistema de Avaliações - Fix Script
# ===================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Parse arguments
ENVIRONMENT="${1:-development}"
COMPOSE_FILE="docker-compose.dev.yml"

if [[ "$ENVIRONMENT" == "production" ]]; then
    COMPOSE_FILE="docker-compose.prod.yml"
elif [[ "$ENVIRONMENT" == "basic" ]]; then
    COMPOSE_FILE="docker-compose.yml"
fi

log "Starting fix process for $ENVIRONMENT environment..."

# Stop containers
log "Stopping containers..."
docker-compose -f "$COMPOSE_FILE" down || true

# Remove problematic containers
log "Removing problematic containers..."
docker container prune -f

# Fix backend dependencies
log "Fixing backend dependencies..."
if [[ -f "sistema-avaliacoes-api/composer.lock" ]]; then
    warning "Removing composer.lock to force fresh install..."
    rm -f sistema-avaliacoes-api/composer.lock
fi

# Clean Docker build cache
log "Cleaning Docker build cache..."
docker builder prune -f

# Rebuild backend container
log "Rebuilding backend container..."
docker-compose -f "$COMPOSE_FILE" build --no-cache backend

# Fix frontend dependencies  
log "Fixing frontend dependencies..."
if [[ -f "sistema-avaliacoes/package-lock.json" ]]; then
    warning "Removing package-lock.json to force fresh install..."
    rm -f sistema-avaliacoes/package-lock.json
fi

# Rebuild frontend container
log "Rebuilding frontend container..."
docker-compose -f "$COMPOSE_FILE" build --no-cache frontend

# Start services
log "Starting services..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for services
log "Waiting for services to initialize..."
sleep 30

# Fix backend autoload inside container
log "Fixing autoload inside backend container..."
docker-compose -f "$COMPOSE_FILE" exec -T backend composer dump-autoload --optimize || true

# Run database setup
log "Running database setup..."
docker-compose -f "$COMPOSE_FILE" exec -T backend php bin/console doctrine:migrations:migrate --no-interaction || true
docker-compose -f "$COMPOSE_FILE" exec -T backend php bin/console doctrine:fixtures:load --no-interaction || true

# Test backend
log "Testing backend..."
sleep 10
if curl -f -s http://localhost:8081/api/doc > /dev/null 2>&1; then
    log "✓ Backend is working correctly"
else
    error "✗ Backend is still having issues"
    info "Checking backend logs..."
    docker-compose -f "$COMPOSE_FILE" logs --tail=20 backend
fi

# Test frontend (if not production)
if [[ "$ENVIRONMENT" != "production" ]]; then
    log "Testing frontend..."
    if curl -f -s http://localhost:4200 > /dev/null 2>&1; then
        log "✓ Frontend is working correctly"
    else
        warning "Frontend may still be building..."
        info "Checking frontend logs..."
        docker-compose -f "$COMPOSE_FILE" logs --tail=20 frontend
    fi
fi

log "Fix process completed!"
info "If issues persist, try:"
echo "  1. Check logs: docker-compose -f $COMPOSE_FILE logs"
echo "  2. Access container: docker-compose -f $COMPOSE_FILE exec backend /bin/bash"
echo "  3. Manual composer install: docker-compose -f $COMPOSE_FILE exec backend composer install"
echo "  4. Complete rebuild: docker-compose -f $COMPOSE_FILE down -v && docker-compose -f $COMPOSE_FILE up --build"

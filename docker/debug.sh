#!/bin/bash

# ===================================
# Sistema de Avaliações - Debug Script
# ===================================

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[DEBUG] $1${NC}"
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

log "Debugging $ENVIRONMENT environment..."

# Check Docker installation
info "Checking Docker installation..."
docker --version
docker-compose --version

# Check containers status
info "Container status:"
docker-compose -f "$COMPOSE_FILE" ps

# Check backend specifically
log "Checking backend container..."
if docker-compose -f "$COMPOSE_FILE" ps backend | grep -q "Up"; then
    log "✓ Backend container is running"
    
    # Check autoload file
    info "Checking autoload files in backend..."
    docker-compose -f "$COMPOSE_FILE" exec backend ls -la vendor/ || error "Vendor directory not found"
    docker-compose -f "$COMPOSE_FILE" exec backend ls -la vendor/autoload.php || error "autoload.php not found"
    docker-compose -f "$COMPOSE_FILE" exec backend ls -la vendor/autoload_runtime.php || warning "autoload_runtime.php not found"
    
    # Check PHP configuration
    info "Checking PHP configuration..."
    docker-compose -f "$COMPOSE_FILE" exec backend php --version
    docker-compose -f "$COMPOSE_FILE" exec backend php -m | grep -E "(sqlite|pdo)"
    
    # Check Composer
    info "Checking Composer status..."
    docker-compose -f "$COMPOSE_FILE" exec backend composer --version
    docker-compose -f "$COMPOSE_FILE" exec backend composer diagnose || warning "Composer diagnosis failed"
    
    # Check application structure
    info "Checking application structure..."
    docker-compose -f "$COMPOSE_FILE" exec backend ls -la
    docker-compose -f "$COMPOSE_FILE" exec backend ls -la public/
    docker-compose -f "$COMPOSE_FILE" exec backend ls -la config/
    
    # Check database
    info "Checking database..."
    docker-compose -f "$COMPOSE_FILE" exec backend ls -la var/
    docker-compose -f "$COMPOSE_FILE" exec backend php bin/console doctrine:migrations:status || warning "Migration status failed"
    
    # Test API endpoint
    info "Testing API endpoint..."
    if curl -f -s http://localhost:8081/api/doc > /dev/null 2>&1; then
        log "✓ API is responding"
    else
        error "✗ API is not responding"
        warning "Checking backend logs..."
        docker-compose -f "$COMPOSE_FILE" logs --tail=10 backend
    fi
    
else
    error "Backend container is not running"
fi

# Check frontend
if [[ "$ENVIRONMENT" != "production" ]]; then
    log "Checking frontend container..."
    if docker-compose -f "$COMPOSE_FILE" ps frontend | grep -q "Up"; then
        log "✓ Frontend container is running"
        
        # Check Node.js
        info "Checking Node.js configuration..."
        docker-compose -f "$COMPOSE_FILE" exec frontend node --version
        docker-compose -f "$COMPOSE_FILE" exec frontend npm --version
        
        # Check dependencies
        info "Checking frontend dependencies..."
        docker-compose -f "$COMPOSE_FILE" exec frontend ls -la node_modules/ || warning "node_modules not found"
        
        # Test frontend endpoint
        info "Testing frontend endpoint..."
        if curl -f -s http://localhost:4200 > /dev/null 2>&1; then
            log "✓ Frontend is responding"
        else
            warning "Frontend may still be building or having issues"
        fi
    else
        error "Frontend container is not running"
    fi
fi

# Check network connectivity
log "Checking network connectivity..."
docker network ls | grep avaliacoes || warning "Network not found"

# Check volumes
log "Checking volumes..."
docker volume ls | grep avaliacoes || warning "No volumes found"

# Show resource usage
info "Resource usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Show recent logs
info "Recent logs (last 20 lines):"
docker-compose -f "$COMPOSE_FILE" logs --tail=20

log "Debug completed!"
echo
info "Common fixes:"
echo "  1. Rebuild containers: docker-compose -f $COMPOSE_FILE up --build --force-recreate"
echo "  2. Fix autoload: docker-compose -f $COMPOSE_FILE exec backend composer dump-autoload"
echo "  3. Reset database: docker-compose -f $COMPOSE_FILE exec backend php bin/console doctrine:database:drop --force && php bin/console doctrine:database:create"
echo "  4. Run fix script: ./docker/fix.sh $ENVIRONMENT"
echo "  5. Complete reset: docker-compose -f $COMPOSE_FILE down -v && docker system prune -f"

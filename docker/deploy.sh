#!/bin/bash

# ===================================
# Sistema de Avaliações - Deploy Script
# ===================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Default values
ENVIRONMENT="development"
BUILD_FRESH=false
SKIP_SETUP=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -f|--fresh)
            BUILD_FRESH=true
            shift
            ;;
        -s|--skip-setup)
            SKIP_SETUP=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -e, --environment    Environment (development|production) [default: development]"
            echo "  -f, --fresh          Force fresh build (remove all containers and volumes)"
            echo "  -s, --skip-setup     Skip initial setup steps"
            echo "  -h, --help           Show this help message"
            exit 0
            ;;
        *)
            error "Unknown option $1"
            ;;
    esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "production" ]]; then
    error "Environment must be 'development' or 'production'"
fi

log "Starting deployment for $ENVIRONMENT environment..."

# Check Docker installation
if ! command -v docker &> /dev/null; then
    error "Docker is not installed"
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed"
fi

# Set compose file based on environment
if [[ "$ENVIRONMENT" == "production" ]]; then
    COMPOSE_FILE="docker-compose.prod.yml"
else
    COMPOSE_FILE="docker-compose.dev.yml"
fi

# Navigate to project root
cd "$(dirname "$0")/.."

# Fresh build if requested
if [[ "$BUILD_FRESH" == true ]]; then
    warning "Performing fresh build - this will remove all containers and volumes"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Stopping and removing containers..."
        docker-compose -f "$COMPOSE_FILE" down -v --remove-orphans
        
        log "Removing unused images..."
        docker system prune -f
    else
        info "Fresh build cancelled"
    fi
fi

# Setup steps
if [[ "$SKIP_SETUP" == false ]]; then
    log "Running setup steps..."
    
    # Copy environment file
    if [[ ! -f ".env" ]]; then
        cp .env.docker .env
        log "Created .env file from .env.docker"
    fi
    
    # Create required directories
    mkdir -p docker/postgres
    mkdir -p logs/{nginx,backend,frontend}
    mkdir -p uploads
    
    # Set permissions
    chmod +x docker/deploy.sh
    chmod +x docker/backup.sh
fi

# Build and start services
log "Building and starting services..."
docker-compose -f "$COMPOSE_FILE" up --build -d

# Wait for services to be ready
log "Waiting for services to be ready..."
sleep 30

# Health checks
log "Performing health checks..."

# Check backend
if curl -f http://localhost:8081/api/doc > /dev/null 2>&1; then
    log "✓ Backend is healthy"
else
    warning "Backend health check failed"
fi

# Check frontend (development only)
if [[ "$ENVIRONMENT" == "development" ]]; then
    if curl -f http://localhost:4200 > /dev/null 2>&1; then
        log "✓ Frontend is healthy"
    else
        warning "Frontend health check failed"
    fi
fi

# Show service status
log "Service status:"
docker-compose -f "$COMPOSE_FILE" ps

# Show useful information
log "Deployment completed!"
echo
info "Access URLs:"
if [[ "$ENVIRONMENT" == "development" ]]; then
    echo "  Frontend: http://localhost:4200"
    echo "  Backend API: http://localhost:8081"
    echo "  API Documentation: http://localhost:8081/api/doc"
    echo "  Database: localhost:5432"
else
    echo "  Application: http://localhost:8080"
    echo "  API Documentation: http://localhost:8080/api/doc"
fi
echo
info "Useful commands:"
echo "  View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "  Stop services: docker-compose -f $COMPOSE_FILE down"
echo "  Restart services: docker-compose -f $COMPOSE_FILE restart"
echo "  Execute backend commands: docker-compose -f $COMPOSE_FILE exec backend /bin/sh"
echo "  Execute frontend commands: docker-compose -f $COMPOSE_FILE exec frontend /bin/sh"

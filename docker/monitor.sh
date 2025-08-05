#!/bin/bash

# ===================================
# Sistema de Avaliações - Monitoring Script
# ===================================

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
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

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
CHECK_INTERVAL=30

# Health check function
check_service() {
    local service=$1
    local url=$2
    local name=$3
    
    if curl -f -s "$url" > /dev/null 2>&1; then
        log "✓ $name is healthy"
        return 0
    else
        error "✗ $name is unhealthy"
        return 1
    fi
}

# Monitor function
monitor_services() {
    log "Monitoring services..."
    
    # Check container status
    info "Container Status:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo
    info "Health Checks:"
    
    # Check backend API
    check_service "backend" "http://localhost:8080/api/doc" "Backend API"
    
    # Check frontend
    check_service "frontend" "http://localhost:8080" "Frontend"
    
    # Check database connection
    if docker-compose -f "$COMPOSE_FILE" exec -T database pg_isready -U avaliacoes_user > /dev/null 2>&1; then
        log "✓ Database is healthy"
    else
        error "✗ Database is unhealthy"
    fi
    
    # Check Redis
    if docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping > /dev/null 2>&1; then
        log "✓ Redis is healthy"
    else
        error "✗ Redis is unhealthy"
    fi
    
    echo
    info "Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    
    echo
    info "Disk Usage:"
    docker system df
}

# Continuous monitoring
continuous_monitor() {
    log "Starting continuous monitoring (interval: ${CHECK_INTERVAL}s)"
    log "Press Ctrl+C to stop"
    
    while true; do
        clear
        echo "==========================================="
        echo "   Sistema de Avaliações - Monitor"
        echo "==========================================="
        echo
        
        monitor_services
        
        echo
        info "Next check in ${CHECK_INTERVAL} seconds..."
        sleep "$CHECK_INTERVAL"
    done
}

# Parse arguments
case "${1:-status}" in
    status)
        monitor_services
        ;;
    continuous)
        continuous_monitor
        ;;
    logs)
        log "Showing recent logs..."
        docker-compose -f "$COMPOSE_FILE" logs --tail=50 -f
        ;;
    resources)
        log "Resource usage:"
        docker stats --no-stream
        ;;
    *)
        echo "Usage: $0 [status|continuous|logs|resources]"
        echo "  status     - Check service status once (default)"
        echo "  continuous - Continuous monitoring"
        echo "  logs       - Show recent logs"
        echo "  resources  - Show resource usage"
        exit 1
        ;;
esac

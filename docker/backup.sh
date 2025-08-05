#!/bin/bash

# ===================================
# Sistema de Avaliações - Backup Script
# ===================================

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
COMPOSE_FILE="docker-compose.prod.yml"

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "Starting backup process..."

# Database backup
log "Backing up database..."
docker-compose -f "$COMPOSE_FILE" exec -T database pg_dump -U avaliacoes_user sistema_avaliacoes > "$BACKUP_DIR/database_$DATE.sql"

# Backend uploads backup
log "Backing up uploads..."
docker run --rm -v avaliacoes_backend-uploads:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/uploads_$DATE.tar.gz -C /data .

# Configuration backup
log "Backing up configuration..."
tar czf "$BACKUP_DIR/config_$DATE.tar.gz" docker/ .env* *.yml

# Log backup
log "Backing up logs..."
docker run --rm -v avaliacoes_backend-logs:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/logs_$DATE.tar.gz -C /data .

# Create complete backup
log "Creating complete backup archive..."
cd "$BACKUP_DIR"
tar czf "complete_backup_$DATE.tar.gz" database_$DATE.sql uploads_$DATE.tar.gz config_$DATE.tar.gz logs_$DATE.tar.gz
cd ..

# Cleanup old backups (keep last 7 days)
log "Cleaning up old backups..."
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

log "Backup completed successfully!"
log "Backup files created in: $BACKUP_DIR"
log "Complete backup: $BACKUP_DIR/complete_backup_$DATE.tar.gz"

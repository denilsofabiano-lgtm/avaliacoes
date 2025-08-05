# ===================================
# Sistema de Avaliações - Makefile
# ===================================

.PHONY: help dev prod basic up down logs clean backup monitor setup

# Default target
.DEFAULT_GOAL := help

# Variables
COMPOSE_DEV = docker-compose -f docker-compose.dev.yml
COMPOSE_PROD = docker-compose -f docker-compose.prod.yml
COMPOSE_BASIC = docker-compose

help: ## Show this help message
	@echo "Sistema de Avaliações - Docker Commands"
	@echo "======================================="
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# Setup commands
setup: ## Initial setup (permissions and directories)
	@echo "Setting up project..."
	@mkdir -p logs/{nginx,backend,frontend} uploads backups
	@cp .env.docker .env
	@chmod +x docker/deploy.sh docker/backup.sh docker/monitor.sh
	@echo "Setup completed!"

# Development commands
dev: ## Start development environment
	@echo "Starting development environment..."
	$(COMPOSE_DEV) up --build -d
	@echo "Development environment started!"
	@echo "Frontend: http://localhost:4200"
	@echo "Backend: http://localhost:8081"

dev-logs: ## Show development logs
	$(COMPOSE_DEV) logs -f

dev-down: ## Stop development environment
	$(COMPOSE_DEV) down

dev-clean: ## Clean development environment (remove volumes)
	$(COMPOSE_DEV) down -v --remove-orphans

# Production commands
prod: ## Start production environment
	@echo "Starting production environment..."
	$(COMPOSE_PROD) up --build -d
	@echo "Production environment started!"
	@echo "Application: http://localhost:8080"

prod-logs: ## Show production logs
	$(COMPOSE_PROD) logs -f

prod-down: ## Stop production environment
	$(COMPOSE_PROD) down

prod-clean: ## Clean production environment (remove volumes)
	$(COMPOSE_PROD) down -v --remove-orphans

# Basic commands
basic: ## Start basic environment (SQLite)
	@echo "Starting basic environment..."
	$(COMPOSE_BASIC) up --build -d
	@echo "Basic environment started!"
	@echo "Frontend: http://localhost:4200"
	@echo "Backend: http://localhost:8081"

basic-down: ## Stop basic environment
	$(COMPOSE_BASIC) down

# General commands
up: dev ## Alias for dev (default environment)

down: ## Stop current environment
	@docker-compose down 2>/dev/null || true
	$(COMPOSE_DEV) down 2>/dev/null || true
	$(COMPOSE_PROD) down 2>/dev/null || true

logs: ## Show logs from current environment
	@docker-compose logs -f 2>/dev/null || $(COMPOSE_DEV) logs -f

status: ## Show status of all containers
	@echo "Container Status:"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Database commands
db-reset: ## Reset database (development)
	$(COMPOSE_DEV) exec backend php bin/console doctrine:database:drop --force --if-exists
	$(COMPOSE_DEV) exec backend php bin/console doctrine:database:create
	$(COMPOSE_DEV) exec backend php bin/console doctrine:migrations:migrate --no-interaction
	$(COMPOSE_DEV) exec backend php bin/console doctrine:fixtures:load --no-interaction

db-migrate: ## Run database migrations
	$(COMPOSE_DEV) exec backend php bin/console doctrine:migrations:migrate --no-interaction

db-fixtures: ## Load database fixtures
	$(COMPOSE_DEV) exec backend php bin/console doctrine:fixtures:load --no-interaction

# Backup and monitoring
backup: ## Create backup
	@chmod +x docker/backup.sh
	./docker/backup.sh

monitor: ## Monitor services
	@chmod +x docker/monitor.sh
	./docker/monitor.sh status

monitor-live: ## Live monitoring
	@chmod +x docker/monitor.sh
	./docker/monitor.sh continuous

# Maintenance commands
clean: ## Clean all Docker resources
	@echo "Cleaning Docker resources..."
	docker system prune -f
	docker volume prune -f
	@echo "Clean completed!"

rebuild: ## Rebuild all containers
	@echo "Rebuilding all containers..."
	$(COMPOSE_DEV) down
	$(COMPOSE_DEV) up --build --force-recreate -d

# Access containers
backend-shell: ## Access backend container shell
	$(COMPOSE_DEV) exec backend /bin/bash

frontend-shell: ## Access frontend container shell
	$(COMPOSE_DEV) exec frontend /bin/sh

db-shell: ## Access database shell
	$(COMPOSE_DEV) exec database psql -U avaliacoes_user sistema_avaliacoes

# Testing
test-backend: ## Run backend tests
	$(COMPOSE_DEV) exec backend php bin/phpunit

test-frontend: ## Run frontend tests
	$(COMPOSE_DEV) exec frontend npm run test

# Quick deploy shortcuts
deploy-dev: setup dev ## Setup and deploy development
	@echo "Development deployment completed!"

deploy-prod: setup prod ## Setup and deploy production
	@echo "Production deployment completed!"

# Show environment info
info: ## Show environment information
	@echo "Sistema de Avaliações - Environment Info"
	@echo "========================================"
	@echo "Docker version:"
	@docker --version
	@echo "Docker Compose version:"
	@docker-compose --version
	@echo ""
	@echo "Available environments:"
	@echo "  make dev       - Development (PostgreSQL + Redis)"
	@echo "  make prod      - Production (Optimized build)"
	@echo "  make basic     - Basic (SQLite only)"
	@echo ""
	@echo "Quick start:"
	@echo "  make deploy-dev   - Complete development setup"
	@echo "  make deploy-prod  - Complete production setup"

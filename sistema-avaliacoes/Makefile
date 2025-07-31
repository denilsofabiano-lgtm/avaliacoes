# Sistema de Avaliações - Makefile

.PHONY: help build dev prod stop clean logs health

# Cores para output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

# Configurações
PROJECT_NAME=sistema-avaliacoes
DOCKER_COMPOSE_DEV=docker-compose -f docker-compose.dev.yml
DOCKER_COMPOSE_PROD=docker-compose

help: ## Mostra esta ajuda
	@echo "$(BLUE)Sistema de Avaliações - Comandos Docker$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Build da aplicação para produção
	@echo "$(YELLOW)🔨 Building production image...$(NC)"
	$(DOCKER_COMPOSE_PROD) build --no-cache

dev: ## Inicia ambiente de desenvolvimento
	@echo "$(YELLOW)🚀 Starting development environment...$(NC)"
	$(DOCKER_COMPOSE_DEV) up -d
	@echo "$(GREEN)✅ Development server running at: http://localhost:4200$(NC)"

prod: ## Inicia ambiente de produção
	@echo "$(YELLOW)🚀 Starting production environment...$(NC)"
	$(DOCKER_COMPOSE_PROD) up -d
	@echo "$(GREEN)✅ Production server running at: http://localhost:8080$(NC)"

stop: ## Para todos os containers
	@echo "$(YELLOW)🛑 Stopping all containers...$(NC)"
	$(DOCKER_COMPOSE_DEV) down 2>/dev/null || true
	$(DOCKER_COMPOSE_PROD) down 2>/dev/null || true
	@echo "$(GREEN)✅ All containers stopped$(NC)"

restart-dev: stop dev ## Reinicia ambiente de desenvolvimento

restart-prod: stop prod ## Reinicia ambiente de produção

logs: ## Mostra logs dos containers (uso: make logs SERVICE=frontend)
	@if [ -z "$(SERVICE)" ]; then \
		echo "$(YELLOW)📋 Showing all logs...$(NC)"; \
		$(DOCKER_COMPOSE_PROD) logs -f; \
	else \
		echo "$(YELLOW)📋 Showing logs for $(SERVICE)...$(NC)"; \
		$(DOCKER_COMPOSE_PROD) logs -f $(SERVICE); \
	fi

logs-dev: ## Mostra logs do ambiente de desenvolvimento
	@echo "$(YELLOW)📋 Showing development logs...$(NC)"
	$(DOCKER_COMPOSE_DEV) logs -f

health: ## Verifica saúde dos containers
	@echo "$(YELLOW)🏥 Checking container health...$(NC)"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep $(PROJECT_NAME) || echo "$(RED)No containers running$(NC)"

clean: ## Remove containers, imagens e volumes (CUIDADO!)
	@echo "$(RED)⚠️  This will remove all containers, images and volumes!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo ""; \
		echo "$(YELLOW)🧹 Cleaning up...$(NC)"; \
		$(DOCKER_COMPOSE_DEV) down -v --remove-orphans 2>/dev/null || true; \
		$(DOCKER_COMPOSE_PROD) down -v --remove-orphans 2>/dev/null || true; \
		docker system prune -af; \
		echo "$(GREEN)✅ Cleanup completed$(NC)"; \
	else \
		echo ""; \
		echo "$(BLUE)Cancelled$(NC)"; \
	fi

shell: ## Acessa shell do container frontend
	@echo "$(YELLOW)🐚 Opening shell in frontend container...$(NC)"
	@docker exec -it $(PROJECT_NAME)-frontend /bin/sh || docker exec -it $(PROJECT_NAME)-frontend-dev /bin/sh

db-shell: ## Acessa shell do PostgreSQL
	@echo "$(YELLOW)🐚 Opening PostgreSQL shell...$(NC)"
	@docker exec -it $(PROJECT_NAME)-db psql -U avaliacoes_user -d sistema_avaliacoes || docker exec -it $(PROJECT_NAME)-db-dev psql -U dev_user -d sistema_avaliacoes_dev

backup: ## Faz backup do banco de dados
	@echo "$(YELLOW)💾 Creating database backup...$(NC)"
	@mkdir -p backups
	@docker exec $(PROJECT_NAME)-db pg_dump -U avaliacoes_user sistema_avaliacoes > backups/backup-$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Backup created in backups/ directory$(NC)"

restore: ## Restaura backup do banco (uso: make restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)❌ Please specify backup file: make restore FILE=backup.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)📥 Restoring database from $(FILE)...$(NC)"
	@docker exec -i $(PROJECT_NAME)-db psql -U avaliacoes_user -d sistema_avaliacoes < $(FILE)
	@echo "$(GREEN)✅ Database restored$(NC)"

install: ## Instala dependências
	@echo "$(YELLOW)📦 Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

test: ## Executa testes
	@echo "$(YELLOW)🧪 Running tests...$(NC)"
	npm test

lint: ## Executa linting
	@echo "$(YELLOW)🔍 Running linter...$(NC)"
	npm run lint

build-local: ## Build local da aplicação
	@echo "$(YELLOW)🔨 Building application locally...$(NC)"
	npm run build

status: ## Mostra status dos serviços
	@echo "$(BLUE)📊 Service Status:$(NC)"
	@echo ""
	@echo "$(YELLOW)Containers:$(NC)"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep $(PROJECT_NAME) || echo "No containers running"
	@echo ""
	@echo "$(YELLOW)Images:$(NC)"
	@docker images | grep $(PROJECT_NAME) || echo "No images found"
	@echo ""
	@echo "$(YELLOW)Volumes:$(NC)"
	@docker volume ls | grep $(PROJECT_NAME) || echo "No volumes found"

update: ## Atualiza imagens Docker
	@echo "$(YELLOW)⬇️  Updating Docker images...$(NC)"
	docker pull node:18-alpine
	docker pull nginx:alpine
	docker pull postgres:15-alpine
	docker pull redis:7-alpine
	@echo "$(GREEN)✅ Images updated$(NC)"

# Comandos compostos
setup: install build ## Setup completo do projeto

deploy-dev: stop dev health ## Deploy completo para desenvolvimento

deploy-prod: stop build prod health ## Deploy completo para produção

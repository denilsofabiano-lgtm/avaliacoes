# 🐳 Sistema de Avaliações - Docker Deployment

Este projeto foi organizado para facilitar o deploy com Docker e Docker Compose, suportando ambientes de desenvolvimento e produção.

## 📁 Estrutura de Arquivos Docker

```
docker/
├── development/
│   ├── frontend.Dockerfile     # Angular dev build
│   └── backend.Dockerfile      # Symfony dev build
├── production/
│   ├── frontend.Dockerfile     # Angular prod build
│   └── backend.Dockerfile      # Symfony prod build
├── nginx/
│   ├── nginx.conf             # Configuração principal do Nginx
│   ├── frontend.conf          # Config para frontend
│   └── production.conf        # Config para produção
├── deploy.sh                  # Script de deploy automatizado
├── backup.sh                  # Script de backup
└── monitor.sh                 # Script de monitoramento

# Arquivos Docker Compose
docker-compose.yml             # Setup básico (desenvolvimento)
docker-compose.dev.yml         # Desenvolvimento completo
docker-compose.prod.yml        # Produção completa
.env.docker                   # Variáveis de ambiente
```

## 🚀 Deploy Rápido

### Desenvolvimento (Básico)
```bash
# Clone e navegue para o projeto
git clone <repo-url>
cd sistema-avaliacoes

# Deploy básico
docker-compose up --build
```

**Acesso:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:8081
- Documentação: http://localhost:8081/api/doc

### Desenvolvimento (Completo)
```bash
# Deploy com banco PostgreSQL e Redis
docker-compose -f docker-compose.dev.yml up --build -d

# Ou usando o script automatizado
chmod +x docker/deploy.sh
./docker/deploy.sh --environment development
```

### Produção
```bash
# Deploy de produção
./docker/deploy.sh --environment production

# Ou manualmente
docker-compose -f docker-compose.prod.yml up --build -d
```

**Acesso Produção:**
- Aplicação: http://localhost:8080
- API: http://localhost:8080/api/doc

## 🛠️ Scripts de Gerenciamento

### Deploy Script
```bash
# Deploy com opções
./docker/deploy.sh [OPTIONS]

# Opções:
-e, --environment    # development|production (padrão: development)
-f, --fresh         # Build limpo (remove containers e volumes)
-s, --skip-setup    # Pular etapas de setup
-h, --help          # Ajuda
```

**Exemplos:**
```bash
# Deploy desenvolvimento
./docker/deploy.sh -e development

# Deploy produção com build limpo
./docker/deploy.sh -e production -f

# Deploy sem setup
./docker/deploy.sh -s
```

### Monitoramento
```bash
# Status dos serviços
./docker/monitor.sh status

# Monitoramento contínuo
./docker/monitor.sh continuous

# Logs em tempo real
./docker/monitor.sh logs

# Uso de recursos
./docker/monitor.sh resources
```

### Backup
```bash
# Backup completo
./docker/backup.sh

# Backups são salvos em ./backups/
# Mantém últimos 7 dias automaticamente
```

## 📊 Ambientes Disponíveis

### 🔧 Desenvolvimento (docker-compose.dev.yml)
**Serviços:**
- Frontend (Angular) - Porta 4200
- Backend (Symfony) - Porta 8081  
- PostgreSQL - Porta 5432
- Redis - Porta 6379

**Características:**
- Hot reload ativado
- Volumes para desenvolvimento
- Logs detalhados
- Debug ativado

### 🚀 Produção (docker-compose.prod.yml)
**Serviços:**
- Frontend (Nginx + Angular build)
- Backend (PHP-FPM + Nginx)
- PostgreSQL
- Redis com senha
- Nginx Reverse Proxy

**Características:**
- Build otimizado
- Cache ativado
- Logs rotativos
- Health checks
- Security headers

### ⚡ Básico (docker-compose.yml)
**Serviços:**
- Frontend (Angular dev)
- Backend (Symfony dev com SQLite)

**Características:**
- Setup mínimo
- SQLite (sem PostgreSQL)
- Ideal para testes rápidos

## 🔧 Comandos Úteis

### Docker Compose
```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Rebuild completo
docker-compose up --build --force-recreate

# Logs específicos
docker-compose logs -f backend

# Executar comandos no container
docker-compose exec backend php bin/console doctrine:migrations:status
docker-compose exec frontend npm run test
```

### Gerenciamento de Dados
```bash
# Reset banco de dados
docker-compose exec backend php bin/console doctrine:database:drop --force
docker-compose exec backend php bin/console doctrine:database:create
docker-compose exec backend php bin/console doctrine:migrations:migrate --no-interaction

# Carregar fixtures
docker-compose exec backend php bin/console doctrine:fixtures:load --no-interaction

# Backup manual do banco
docker-compose exec database pg_dump -U avaliacoes_user sistema_avaliacoes > backup.sql

# Restaurar backup
docker-compose exec -T database psql -U avaliacoes_user sistema_avaliacoes < backup.sql
```

### Manutenção
```bash
# Limpar containers não utilizados
docker system prune -f

# Limpar volumes órfãos
docker volume prune -f

# Ver uso de espaço
docker system df

# Logs de um serviço específico
docker-compose logs -f --tail=100 backend
```

## 🔐 Configuração de Segurança (Produção)

### Variáveis de Ambiente Obrigatórias
```bash
# .env (produção)
APP_ENV=prod
DATABASE_URL=postgresql://user:password@database:5432/sistema_avaliacoes
JWT_PASSPHRASE=sua-senha-segura-aqui
REDIS_PASSWORD=sua-senha-redis-aqui
```

### SSL/HTTPS (Opcional)
Para adicionar SSL em produção, modifique o `docker/nginx/production.conf`:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;
    # ... resto da config
}
```

## 🐛 Troubleshooting

### Problemas Comuns

**1. "Port already in use"**
```bash
# Verificar portas em uso
sudo netstat -tulpn | grep :4200
sudo netstat -tulpn | grep :8081

# Parar processos
docker-compose down
```

**2. "Permission denied"**
```bash
# Dar permissões aos scripts
chmod +x docker/deploy.sh
chmod +x docker/backup.sh
chmod +x docker/monitor.sh
```

**3. "Database connection failed"**
```bash
# Verificar se o banco está rodando
docker-compose ps database

# Verificar logs do banco
docker-compose logs database

# Reset completo
docker-compose down -v
docker-compose up --build
```

**4. "Frontend not loading"**
```bash
# Verificar se o build Angular está completo
docker-compose logs frontend

# Rebuild frontend
docker-compose up --build frontend
```

### Logs e Debug
```bash
# Logs de todos os serviços
docker-compose logs -f

# Logs específicos com timestamps
docker-compose logs -f -t backend

# Entrar no container para debug
docker-compose exec backend /bin/bash
docker-compose exec frontend /bin/sh
```

## 📈 Monitoramento e Performance

### Métricas Disponíveis
- Status dos containers
- Uso de CPU e memória
- Uso de disco
- Health checks automáticos
- Logs centralizados

### Alertas (Configurar se necessário)
```bash
# Script de health check customizado
./docker/monitor.sh continuous

# Pode ser integrado com:
# - Prometheus
# - Grafana  
# - AlertManager
# - Slack/Discord webhooks
```

## 🔄 CI/CD Integration

### GitHub Actions (exemplo)
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: ./docker/deploy.sh -e production
```

### GitLab CI (exemplo)
```yaml
deploy:
  stage: deploy
  script:
    - ./docker/deploy.sh -e production
  only:
    - main
```

## 📞 Suporte

Para problemas relacionados ao Docker:
1. Verifique os logs: `docker-compose logs`
2. Consulte este README
3. Execute o script de monitoramento: `./docker/monitor.sh status`
4. Verifique o arquivo `SETUP_TROUBLESHOOTING.md` para problemas específicos

---

**Sistema de Avaliações** - Deployment com Docker 🐳

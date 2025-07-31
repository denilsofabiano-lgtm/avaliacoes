# 🐳 Sistema de Avaliações - Deploy com Docker

Este documento descreve como fazer deploy da aplicação Sistema de Avaliações usando Docker e Docker Compose.

## 📋 Pré-requisitos

- Docker (versão 20.0 ou superior)
- Docker Compose (versão 2.0 ou superior)
- 4GB RAM livre
- 2GB espaço em disco

## 🚀 Deploy Rápido

### Produção
```bash
# Clone o repositório
git clone <repository-url>
cd sistema-avaliacoes

# Execute o deploy
./deploy.sh prod
```

### Desenvolvimento
```bash
# Execute o deploy de desenvolvimento
./deploy.sh dev
```

## 📁 Estrutura dos Arquivos Docker

```
sistema-avaliacoes/
├── Dockerfile              # Build para produção
├── Dockerfile.dev          # Build para desenvolvimento
├── docker-compose.yml      # Orquestração produção
├── docker-compose.dev.yml  # Orquestração desenvolvimento
├── nginx.conf              # Configuração Nginx
├── .dockerignore           # Arquivos ignorados no build
├── deploy.sh               # Script de deploy automático
└── DOCKER.md               # Esta documentação
```

## 🔧 Comandos Manuais

### Produção

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Parar todos os serviços
docker-compose down

# Rebuild completo
docker-compose up --build -d

# Ver status dos containers
docker-compose ps
```

### Desenvolvimento

```bash
# Subir ambiente de desenvolvimento
docker-compose -f docker-compose.dev.yml up -d

# Ver logs do frontend
docker-compose -f docker-compose.dev.yml logs -f frontend-dev

# Parar ambiente de desenvolvimento
docker-compose -f docker-compose.dev.yml down
```

## 🌐 Portas Expostas

### Produção
- **Frontend**: http://localhost:8080
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Desenvolvimento
- **Frontend**: http://localhost:4200
- **PostgreSQL**: localhost:5433

## 💾 Volumes Persistentes

- **postgres_data**: Dados do PostgreSQL (produção)
- **postgres_dev_data**: Dados do PostgreSQL (desenvolvimento)
- **redis_data**: Cache Redis

## 🔍 Monitoramento

### Health Checks
```bash
# Verificar saúde dos containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Health}}"

# Logs de saúde específicos
docker inspect sistema-avaliacoes-frontend --format='{{.State.Health.Status}}'
```

### Logs
```bash
# Logs do frontend
docker logs sistema-avaliacoes-frontend

# Logs do banco de dados
docker logs sistema-avaliacoes-db

# Logs do Redis
docker logs sistema-avaliacoes-redis
```

## 🛠️ Troubleshooting

### Container não inicia
```bash
# Verificar logs de erro
docker-compose logs [service-name]

# Verificar recursos disponíveis
docker system df
docker system prune  # Limpar recursos não utilizados
```

### Problemas de permissão
```bash
# Dar permissão ao script
chmod +x deploy.sh

# Verificar permissões Docker
sudo usermod -aG docker $USER
# (Reiniciar sessão após o comando acima)
```

### Reset completo
```bash
# Parar todos os containers
docker-compose down

# Remover volumes (CUIDADO: perde dados)
docker-compose down -v

# Remover imagens
docker rmi $(docker images -q sistema-avaliacoes*)

# Rebuild completo
./deploy.sh prod
```

## 🔐 Configurações de Segurança

### Produção
- Alterar senhas padrão do banco de dados
- Configurar SSL/HTTPS no nginx
- Usar secrets do Docker para credenciais
- Implementar backup automático dos volumes

### Variáveis de Ambiente
```bash
# Criar arquivo .env para produção
cp .env.example .env
# Editar conforme necessário
```

## 📊 Performance

### Otimizações
- Build multi-stage para reduzir tamanho da imagem
- Nginx com compressão gzip habilitada
- Cache de assets estáticos
- Health checks para monitoramento

### Recursos Recomendados
- **CPU**: 2 cores
- **RAM**: 4GB
- **Disco**: 10GB SSD

## 📝 Próximos Passos

1. **Backend API**: Adicionar serviço Node.js/Express
2. **Load Balancer**: Configurar nginx como proxy reverso
3. **SSL**: Certificados Let's Encrypt
4. **CI/CD**: Pipeline de deploy automático
5. **Monitoring**: Prometheus + Grafana
6. **Backup**: Estratégia de backup automatizada

## 🆘 Suporte

Para problemas relacionados ao Docker:
1. Verificar logs dos containers
2. Consultar documentação oficial do Docker
3. Abrir issue no repositório do projeto

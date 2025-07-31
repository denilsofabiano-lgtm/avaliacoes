# 🚀 Sistema de Avaliações - Quick Start

## ⚡ Deploy Rápido

### Opção 1: Usando Makefile (Recomendado)
```bash
# Desenvolvimento
make dev

# Produção
make prod

# Ver todos os comandos disponíveis
make help
```

### Opção 2: Usando Script de Deploy
```bash
# Desenvolvimento
./deploy.sh dev

# Produção
./deploy.sh prod
```

### Opção 3: Usando Docker Compose Diretamente
```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml up -d

# Produção
docker-compose up -d
```

## 🌐 URLs de Acesso

### 💻 Desenvolvimento
- **Frontend**: http://localhost:4200
- **Database**: localhost:5433

### 🏭 Produção
- **Frontend**: http://localhost:8080
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 📋 Comandos Úteis

```bash
# Ver logs
make logs

# Parar tudo
make stop

# Status dos containers
make health

# Backup do banco
make backup

# Limpar tudo (CUIDADO!)
make clean
```

## 🛠️ Primeiro Uso

1. **Clone o projeto**
   ```bash
   git clone <repository-url>
   cd sistema-avaliacoes
   ```

2. **Configure variáveis** (opcional)
   ```bash
   cp .env.example .env
   # Edite .env conforme necessário
   ```

3. **Inicie o ambiente**
   ```bash
   make dev  # ou make prod
   ```

4. **Acesse a aplicação**
   - Desenvolvimento: http://localhost:4200
   - Produção: http://localhost:8080

## ❗ Troubleshooting

### Erro de permissão
```bash
# Dar permissão ao script (se necessário)
chmod +x deploy.sh
```

### Container não inicia
```bash
# Ver logs de erro
make logs

# Verificar status
make health
```

### Reset completo
```bash
# Para tudo e limpa
make clean

# Reinicia
make dev  # ou make prod
```

## 📚 Documentação Completa

- **DOCKER.md**: Documentação completa do Docker
- **README.md**: Documentação geral do projeto
- **Makefile**: Todos os comandos disponíveis

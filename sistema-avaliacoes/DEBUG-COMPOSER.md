# 🔧 Debug do Problema Composer no Backend

## 🚨 Problemas Resolvidos

### Problema 1: Composer Install (RESOLVIDO ✅)
```
ERROR: failed to solve: process "/bin/sh -c composer install --prefer-dist --no-scripts --no-autoloader" did not complete successfully: exit code: 4
```

### Problema 2: Nginx Build (RESOLVIDO ✅)
```
ERROR: failed to build: failed to solve: failed to compute cache key: failed to calculate checksum of ref: "/composer.lock": not found
ERROR: Service 'nginx-api-dev' failed to build : Build failed
```

## 🔍 Possíveis Causas
1. **composer.lock inválido** - arquivo de lock não corresponde ao composer.json
2. **Dependências de plataforma** - extensões PHP ausentes
3. **Memória insuficiente** - Composer precisa de mais RAM
4. **Scripts pós-instalação** - scripts do Symfony falhando

## 🛠️ Soluções Aplicadas

### 1. Dockerfiles Alternativos Criados:
- `Dockerfile.dev.fixed` - Versão principal corrigida
- `Dockerfile.dev.simple` - Versão simplificada  
- `Dockerfile.dev.minimal` - Versão mínima para teste

### 2. Melhorias Implementadas:
- ✅ Remoção do composer.lock inválido
- ✅ Configuração COMPOSER_MEMORY_LIMIT=-1
- ✅ Ignore platform requirements problemáticos
- ✅ Fallback commands para instalação
- ✅ Validação do composer.json
- ✅ Verbose output para debug

## 🚀 Como Testar

### Opção 1: Build Direto (Recomendado)
```bash
cd sistema-avaliacoes
./deploy.sh dev
```

### Opção 2: Build Manual
```bash
cd sistema-avaliacoes-api
docker build -f Dockerfile.dev.fixed -t backend-test .
```

### Opção 3: Se Ainda Falhar
```bash
# Use versão minimal
cd sistema-avaliacoes
# Editar docker-compose.dev.yml: dockerfile: Dockerfile.dev.minimal
docker-compose -f docker-compose.dev.yml up --build -d
```

## 📊 Status dos Dockerfiles

| Arquivo | Complexidade | Dependências | Status |
|---------|-------------|--------------|--------|
| Dockerfile.dev.fixed | ⭐⭐⭐ | Completas | ✅ Recomendado |
| Dockerfile.dev.simple | ⭐⭐ | Básicas | ✅ Backup |
| Dockerfile.dev.minimal | ⭐ | Mínimas | ✅ Emergência |

## 🔄 Próximos Passos se o Problema Persistir

1. Verificar logs detalhados:
```bash
docker-compose -f docker-compose.dev.yml logs backend-dev
```

2. Executar composer manualmente no container:
```bash
docker run -it --rm -v $(pwd):/app composer:latest bash
cd /app
composer diagnose
composer install --verbose
```

3. Verificar dependências de sistema:
```bash
docker run -it php:8.2-fpm-alpine sh
apk add postgresql-dev
php -m | grep pdo
```

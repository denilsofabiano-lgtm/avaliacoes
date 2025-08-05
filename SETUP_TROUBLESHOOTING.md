# Guia de Solução de Problemas - Setup

## 🚨 Erros Comuns e Soluções

### 1. "could not find driver"
**Problema:** Extensão SQLite não instalada

**Solução:**
```bash
# Ubuntu/Debian
sudo apt-get install php-sqlite3 php-pdo-sqlite

# CentOS/RHEL
sudo yum install php-pdo php-sqlite3

# macOS
brew install php

# Verificar
php -m | grep sqlite
```

### 2. "getListDatabasesSQL is not supported by platform"
**Problema:** Comando `doctrine:database:create` não funciona com SQLite

**Solução:** Use o novo comando corrigido:
```bash
npm run setup
# ou
npm run setup-full
```

### 3. "The version 'latest' couldn't be reached, there are no registered migrations"
**Problema:** Não existem arquivos de migração no projeto

**Solução:** Uma migração inicial foi criada automaticamente. Execute:
```bash
npm run setup
```

Se ainda tiver problemas, execute manualmente:
```bash
cd sistema-avaliacoes-api
composer install
mkdir -p var
php bin/console doctrine:migrations:migrate --no-interaction
```

### 4. "Class not found"
**Solução:**
```bash
cd sistema-avaliacoes-api
composer dump-autoload
```

### 5. "Database locked"
**Solução:**
```bash
cd sistema-avaliacoes-api
rm var/data.db
php bin/console doctrine:migrations:migrate --no-interaction
```

### 6. "JWT keys not found"
**Solução:**
```bash
npm run backend:jwt
# ou manualmente:
cd sistema-avaliacoes-api
mkdir -p config/jwt
php bin/console lexik:jwt:generate-keypair --skip-if-exists
```

### 7. "There is no extension able to load the configuration for 'nelmio_api_doc'"
**Problema:** Arquivo de configuração existe mas bundle não está instalado

**Solução:**
```bash
rm -f sistema-avaliacoes-api/config/packages/nelmio_api_doc.yaml
npm run setup
```

### 8. "Failed opening required 'autoload_runtime.php'" (Docker)
**Problema:** Composer não instalou as dependências corretamente no container

**Solução Rápida:**
```bash
# Usar script de fix automático
make fix

# Ou manualmente
docker-compose down
docker-compose up --build --force-recreate
```

**Solução Completa:**
```bash
# Debug para verificar o problema
make debug

# Fix específico
./docker/fix.sh development

# Se ainda não funcionar, reset completo
docker-compose down -v
docker system prune -f
docker-compose up --build
```

## 📋 Comandos Disponíveis

### Setup Completo
```bash
npm run setup-full    # SQLite + fixtures + JWT
npm run setup         # Apenas SQLite básico
npm run setup-mysql   # MySQL + fixtures + JWT
```

### Comandos Individuais
```bash
npm run install-all        # Instalar dependências
npm run backend:setup      # Setup básico SQLite
npm run backend:setup-mysql # Setup básico MySQL
npm run backend:fixtures   # Carregar dados de teste
npm run backend:jwt        # Gerar chaves JWT
```

## 🔧 Verificação de Setup

### 1. Verificar PHP
```bash
php --version
php -m | grep -E "(sqlite|pdo|xml|curl)"
```

### 2. Verificar Composer
```bash
composer --version
```

### 3. Verificar banco de dados
```bash
# SQLite
ls -la sistema-avaliacoes-api/var/data.db

# MySQL
mysql -u avaliacoes_user -p -e "SHOW DATABASES;"
```

### 4. Testar API
```bash
# Iniciar servidor
cd sistema-avaliacoes-api
php -S localhost:8081 -t public

# Em outro terminal, testar
curl http://localhost:8081/api/usuarios
```

## 🎯 Setup Alternativo (Apenas Frontend)

Se tiver problemas com o backend, pode usar apenas o frontend:

```bash
cd sistema-avaliacoes
npm install
npm start
```

O frontend funcionará com dados mock quando a API não estiver disponível.

## 📞 Suporte

Se nenhuma solução funcionar:
1. Verifique se todas as extensões PHP estão instaladas
2. Confirme que o Composer está funcionando
3. Tente o setup manual passo a passo
4. Use o modo "apenas frontend" temporariamente

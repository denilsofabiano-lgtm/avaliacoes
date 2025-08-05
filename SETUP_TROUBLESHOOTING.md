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

### 3. "Class not found"
**Solução:**
```bash
cd sistema-avaliacoes-api
composer dump-autoload
```

### 4. "Database locked"
**Solução:**
```bash
cd sistema-avaliacoes-api
rm var/data.db
php bin/console doctrine:migrations:migrate --no-interaction
```

### 5. "JWT keys not found"
**Solução:**
```bash
npm run backend:jwt
# ou manualmente:
cd sistema-avaliacoes-api
mkdir -p config/jwt
php bin/console lexik:jwt:generate-keypair --skip-if-exists
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

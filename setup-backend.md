# Setup do Backend - Instruções Manuais

Como não é possível executar comandos do sistema automaticamente, siga estas instruções para configurar o backend:

## 1. Pré-requisitos

Certifique-se de ter instalado:
- PHP 8.1 ou superior
- Composer
- Extensões PHP: php-sqlite3, php-xml, php-curl

### Verificar instalação:
```bash
php --version
composer --version
```

## 2. Instalar dependências

```bash
cd sistema-avaliacoes-api
composer install
```

## 3. Configurar banco de dados

```bash
# Criar diretório var se não existir
mkdir -p var

# Criar banco SQLite e executar migrações
php bin/console doctrine:database:create --if-not-exists
php bin/console doctrine:migrations:migrate --no-interaction
```

## 4. Carregar dados iniciais

```bash
php bin/console doctrine:fixtures:load --no-interaction
```

## 5. Gerar chaves JWT

```bash
# Criar diretório para chaves JWT
mkdir -p config/jwt

# Gerar chaves (quando solicitado, use a senha: avaliacoes2024)
php bin/console lexik:jwt:generate-keypair
```

Ou manualmente:
```bash
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout
```

## 6. Iniciar servidor

```bash
php -S localhost:8081 -t public
```

## 7. Testar API

Acesse: http://localhost:8081/api/usuarios

Deve retornar JSON com lista de usuários.

## 8. Iniciar Frontend

Em outro terminal:
```bash
cd sistema-avaliacoes
npm start
```

## Credenciais de teste:

- **Admin**: admin@sistema.com / admin123
- **Professor**: professor@sistema.com / prof123  
- **Aluno**: aluno@sistema.com / aluno123

## Problemas comuns:

### "Class not found" 
```bash
composer dump-autoload
```

### "Database locked"
```bash
rm var/data.db
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate --no-interaction
```

### "JWT keys not found"
Verifique se os arquivos existem em `config/jwt/private.pem` e `config/jwt/public.pem`

### Port already in use
Altere a porta:
```bash
php -S localhost:8082 -t public
```

E atualize `sistema-avaliacoes/src/environments/environment.ts`:
```typescript
apiUrl: 'http://localhost:8082/api'
```

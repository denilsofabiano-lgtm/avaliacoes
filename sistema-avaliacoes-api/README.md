# 🚀 Sistema de Avaliações - Backend API

Backend da aplicação Sistema de Avaliações desenvolvido em PHP com Symfony 7.

## 📋 Características

- **Framework**: Symfony 7.0
- **PHP**: 8.2+
- **Banco de Dados**: PostgreSQL 15
- **Autenticação**: JWT (JSON Web Tokens)
- **Documentação**: OpenAPI/Swagger
- **Cache**: Redis
- **Containerização**: Docker

## 🏗️ Arquitetura

```
src/
├── Controller/          # Controllers da API REST
├── Entity/             # Entidades Doctrine
├── Repository/         # Repositórios customizados
├── Service/            # Serviços de negócio
├── EventListener/      # Event listeners
└── DataFixtures/       # Fixtures para dados de teste
```

## 📊 Modelos de Dados

### Entidades Principais

1. **Usuario** - Gestão de usuários (admin, professor, aluno)
2. **Avaliacao** - Avaliações/provas
3. **Questao** - Banco de questões
4. **Disciplina** - Disciplinas escolares
5. **ParticipanteAvaliacao** - Alunos participando de avaliações
6. **AvaliacaoResposta** - Respostas dos alunos

### Relacionamentos

- Usuario → Avaliacoes (1:N)
- Avaliacao → Questoes (N:M)
- Usuario → ParticipanteAvaliacao (1:N)
- Questao → Alternativas (1:N)

## 🔌 Endpoints da API

### Autenticação
```
POST /api/login_check     # Login
POST /api/register        # Registro
GET  /api/profile         # Perfil do usuário
PUT  /api/profile         # Atualizar perfil
```

### Usuários (Admin)
```
GET    /api/usuarios           # Listar usuários
POST   /api/usuarios           # Criar usuário
GET    /api/usuarios/{id}      # Buscar usuário
PUT    /api/usuarios/{id}      # Atualizar usuário
DELETE /api/usuarios/{id}      # Desativar usuário
```

### Avaliações
```
GET    /api/avaliacoes         # Listar avaliações
POST   /api/avaliacoes         # Criar avaliação
GET    /api/avaliacoes/{id}    # Buscar avaliação
PUT    /api/avaliacoes/{id}    # Atualizar avaliação
DELETE /api/avaliacoes/{id}    # Remover avaliação
```

### Questões
```
GET    /api/questoes           # Listar questões
POST   /api/questoes           # Criar questão
GET    /api/questoes/{id}      # Buscar questão
PUT    /api/questoes/{id}      # Atualizar questão
DELETE /api/questoes/{id}      # Remover questão
```

## 🛠️ Configuração

### Variáveis de Ambiente

```bash
# Aplicação
APP_ENV=prod
APP_SECRET=your-secret-key

# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/db

# JWT
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your-passphrase

# CORS
CORS_ALLOW_ORIGIN=http://localhost:8080
```

### Instalação Local

```bash
# Instalar dependências
composer install

# Configurar JWT
mkdir -p config/jwt
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout

# Criar banco de dados
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate

# Carregar fixtures (opcional)
php bin/console doctrine:fixtures:load

# Iniciar servidor
symfony server:start
```

## 🐳 Docker

### Usando Docker Compose

```bash
# Subir todos os serviços
docker-compose up -d

# Acessar container do backend
docker exec -it sistema-avaliacoes-backend bash

# Executar migrations
docker exec sistema-avaliacoes-backend php bin/console doctrine:migrations:migrate

# Carregar fixtures
docker exec sistema-avaliacoes-backend php bin/console doctrine:fixtures:load
```

### URLs dos Serviços

- **API Backend**: http://localhost:8081
- **Frontend**: http://localhost:8080
- **Adminer (DB)**: http://localhost:8082

## 🔐 Segurança

### Autenticação JWT

1. **Login**: `POST /api/login_check`
   ```json
   {
     "username": "admin@sistema.com",
     "password": "senha123"
   }
   ```

2. **Response**:
   ```json
   {
     "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
   }
   ```

3. **Uso**: Incluir header `Authorization: Bearer {token}`

### Roles de Usuário

- **ROLE_ADMIN**: Acesso total ao sistema
- **ROLE_PROFESSOR**: Gerenciar avaliações e questões
- **ROLE_ALUNO**: Participar de avaliações

## 📝 Validações

### Regras de Negócio

- E-mail único por usuário
- CPF único por usuário
- Avaliações só podem ser editadas pelo responsável ou admin
- Questões devem ter pelo menos uma alternativa correta
- Participantes só podem responder avaliações disponíveis

### Validações de Campo

- **E-mail**: Formato válido e único
- **CPF**: Formato válido (11 dígitos) e único
- **Senha**: Mínimo 8 caracteres
- **Nome**: Mínimo 2 caracteres

## 🧪 Testes

```bash
# Executar testes
php bin/phpunit

# Testes com coverage
php bin/phpunit --coverage-html coverage
```

## 📚 Migrations

```bash
# Criar nova migration
php bin/console make:migration

# Executar migrations
php bin/console doctrine:migrations:migrate

# Status das migrations
php bin/console doctrine:migrations:status
```

## 🔧 Comandos Úteis

```bash
# Limpar cache
php bin/console cache:clear

# Validar schema do banco
php bin/console doctrine:schema:validate

# Gerar entidade
php bin/console make:entity

# Gerar controller
php bin/console make:controller

# Gerar fixtures
php bin/console make:fixtures
```

## 📊 Monitoramento

### Logs

- **Aplicação**: `var/log/`
- **Nginx**: logs do container
- **PostgreSQL**: logs do container

### Métricas

- Health checks configurados para todos os serviços
- Endpoints de health: `/health`

## 🚀 Deploy

### Produção

1. **Build da imagem**:
   ```bash
   docker build -t sistema-avaliacoes-api .
   ```

2. **Configurar variáveis de ambiente**
3. **Executar migrations**
4. **Configurar SSL/HTTPS**
5. **Configurar backup do banco**

## 🤝 Contribuição

1. Fork do repositório
2. Criar branch para feature
3. Commit das mudanças
4. Push para o branch
5. Criar Pull Request

## 📄 Licença

Este projeto é proprietário.

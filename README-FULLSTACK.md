# Sistema de Avaliações - Full Stack

Este projeto combina um frontend Angular com um backend PHP/Symfony para criar um sistema completo de avaliações educacionais.

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **PHP** (versão 8.1 ou superior) 
- **Composer** (gerenciador de dependências PHP)
- **SQLite** (incluído no PHP)

### Instalação e Execução

1. **Clone o repositório e instale as dependências:**
```bash
npm run setup
```

2. **Inicie o sistema completo:**
```bash
npm start
```

Isso iniciará simultaneamente:
- **Frontend Angular**: http://localhost:4200
- **Backend Symfony**: http://localhost:8081

## 🔧 Scripts Disponíveis

- `npm start` - Inicia frontend e backend simultaneamente
- `npm run frontend` - Inicia apenas o frontend Angular
- `npm run backend` - Inicia apenas o backend Symfony
- `npm run setup` - Instala dependências e configura o banco
- `npm run install-all` - Instala dependências de ambos projetos

## 👤 Credenciais de Login

O sistema vem com usuários pré-cadastrados:

| Tipo | Email | Senha | Descrição |
|------|-------|-------|-----------|
| **Admin** | admin@sistema.com | admin123 | Acesso completo ao sistema |
| **Professor** | professor@sistema.com | prof123 | Criação de avaliações e questões |
| **Aluno** | aluno@sistema.com | aluno123 | Participação em avaliações |

## 🏗️ Arquitetura

### Frontend (Angular 18)
- **Localização**: `sistema-avaliacoes/`
- **Porta**: 4200
- **Tecnologias**: Angular 18, Angular Material, TypeScript
- **Funcionalidades**: 
  - Dashboard com métricas
  - Gestão de usuários
  - Criação de avaliações
  - Banco de questões
  - Aplicação de provas
  - Relatórios

### Backend (Symfony 7)
- **Localização**: `sistema-avaliacoes-api/`
- **Porta**: 8081
- **Tecnologias**: PHP 8.2, Symfony 7, Doctrine ORM, JWT
- **Banco de Dados**: SQLite (desenvolvimento)
- **Funcionalidades**:
  - API RESTful completa
  - Autenticação JWT
  - CRUD de todas entidades
  - Relatórios e métricas
  - Controle de acesso por roles

## 📚 Endpoints Principais

### Autenticação
- `POST /api/login_check` - Login
- `POST /api/register` - Registro
- `GET /api/profile` - Perfil do usuário

### Usuários
- `GET /api/usuarios` - Listar usuários
- `POST /api/usuarios` - Criar usuário
- `PUT /api/usuarios/{id}` - Atualizar usuário
- `DELETE /api/usuarios/{id}` - Excluir usuário

### Avaliações
- `GET /api/avaliacoes` - Listar avaliações
- `POST /api/avaliacoes` - Criar avaliação
- `PUT /api/avaliacoes/{id}` - Atualizar avaliação

### Relatórios
- `GET /api/relatorios/dashboard` - Dados do dashboard
- `GET /api/relatorios/avaliacoes` - Relatório de avaliações
- `GET /api/relatorios/alunos` - Relatório de alunos

## 🔄 Modo Offline

O frontend possui fallbacks inteligentes que permitem:
- ✅ Login com credenciais de demonstração
- ✅ Navegação completa pela interface
- ✅ Dados de exemplo para todas as seções
- ✅ Simulação de operações CRUD

Isso significa que o sistema funciona perfeitamente mesmo sem o backend!

## 🛠️ Desenvolvimento

### Executar apenas Frontend
```bash
cd sistema-avaliacoes
npm start
```

### Executar apenas Backend
```bash
cd sistema-avaliacoes-api
php -S localhost:8081 -t public
```

### Resetar Banco de Dados
```bash
cd sistema-avaliacoes-api
php bin/console doctrine:database:drop --force
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console doctrine:fixtures:load --no-interaction
```

## 🐳 Docker (Opcional)

Para produção, você pode usar os Dockerfiles incluídos:

```bash
# Build e execução com Docker Compose
docker-compose up --build
```

## 📖 Documentação da API

Com o backend rodando, acesse:
- **Swagger UI**: http://localhost:8081/api/doc

## 🔒 Segurança

- Autenticação JWT com refresh tokens
- Validação de dados entrada
- Controle de acesso baseado em roles
- CORS configurado adequadamente
- Senhas hasheadas com Symfony PasswordHasher

## 🚨 Solução de Problemas

### Backend não inicia
- Verifique se o PHP 8.1+ está instalado: `php --version`
- Verifique se o Composer está instalado: `composer --version`
- Execute: `cd sistema-avaliacoes-api && composer install`

### Frontend não inicia  
- Verifique se o Node.js está instalado: `node --version`
- Execute: `cd sistema-avaliacoes && npm install`

### Problemas de CORS
- O backend está configurado para aceitar requests do localhost:4200
- Verifique se ambos servidores estão rodando nas portas corretas

### Banco de dados
- O SQLite é criado automaticamente em `sistema-avaliacoes-api/var/data.db`
- Para problemas, delete o arquivo e execute `npm run backend:setup`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

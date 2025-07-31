# 📋 Sistema de Avaliações - Documentação da API

## 🔐 Autenticação

### Login
```http
POST /api/login_check
Content-Type: application/json

{
  "username": "admin@sistema.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}
```

### Registro
```http
POST /api/register
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "cpf": "12345678901",
  "senha": "senha123",
  "roles": ["ROLE_ALUNO"]
}
```

### Perfil do Usuário
```http
GET /api/profile
Authorization: Bearer {token}
```

```http
PUT /api/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "João Silva Atualizado",
  "email": "joao.novo@exemplo.com"
}
```

## 👥 Gestão de Usuários

### Listar Usuários (Admin)
```http
GET /api/usuarios?page=1&limit=10&search=joão&status=true
Authorization: Bearer {token}
```

### Criar Usuário (Admin)
```http
POST /api/usuarios
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Maria Santos",
  "email": "maria@escola.com",
  "cpf": "98765432100",
  "roles": ["ROLE_PROFESSOR"],
  "status": true
}
```

### Buscar Usuário (Admin)
```http
GET /api/usuarios/{id}
Authorization: Bearer {token}
```

### Atualizar Usuário (Admin)
```http
PUT /api/usuarios/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Maria Santos Silva",
  "roles": ["ROLE_PROFESSOR", "ROLE_ADMIN"]
}
```

### Desativar Usuário (Admin)
```http
DELETE /api/usuarios/{id}
Authorization: Bearer {token}
```

### Resetar Senha (Admin)
```http
POST /api/usuarios/{id}/reset-password
Authorization: Bearer {token}
```

## 📝 Gestão de Avaliações

### Listar Avaliações
```http
GET /api/avaliacoes?page=1&limit=10&search=matemática&tipoAvaliacaoId=1
Authorization: Bearer {token}
```

### Criar Avaliação
```http
POST /api/avaliacoes
Authorization: Bearer {token}
Content-Type: application/json

{
  "instrucao": "Avaliação de Matemática - 1º Bimestre",
  "tipoAvaliacaoId": 1,
  "statusAvaliacaoId": 1
}
```

### Buscar Avaliação
```http
GET /api/avaliacoes/{id}
Authorization: Bearer {token}
```

### Atualizar Avaliação
```http
PUT /api/avaliacoes/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "instrucao": "Avaliação de Matemática - 1º Bimestre (Atualizada)",
  "statusAvaliacaoId": 2
}
```

### Deletar Avaliação
```http
DELETE /api/avaliacoes/{id}
Authorization: Bearer {token}
```

### Adicionar Questões à Avaliação
```http
POST /api/avaliacoes/{id}/questoes
Authorization: Bearer {token}
Content-Type: application/json

{
  "questoesIds": [1, 2, 3, 4, 5]
}
```

### Remover Questão da Avaliação
```http
DELETE /api/avaliacoes/{id}/questoes/{questaoId}
Authorization: Bearer {token}
```

### Duplicar Avaliação
```http
POST /api/avaliacoes/{id}/duplicar
Authorization: Bearer {token}
```

## ❓ Gestão de Questões

### Listar Questões
```http
GET /api/questoes?page=1&limit=10&search=equação&disciplinaId=1&nivelDificuldadeId=2
Authorization: Bearer {token}
```

### Criar Questão
```http
POST /api/questoes
Authorization: Bearer {token}
Content-Type: application/json

{
  "pergunta": "Qual é o resultado de 2 + 2?",
  "disciplinaId": 1,
  "tipoAlternativaId": 1,
  "nivelDificuldadeId": 1,
  "statusQuestaoId": 1,
  "pontuacao": "1.00",
  "alternativas": [
    {
      "alternativa": "A",
      "conteudo": "3",
      "correta": false
    },
    {
      "alternativa": "B",
      "conteudo": "4",
      "correta": true
    },
    {
      "alternativa": "C",
      "conteudo": "5",
      "correta": false
    }
  ]
}
```

### Buscar Questão
```http
GET /api/questoes/{id}
Authorization: Bearer {token}
```

### Atualizar Questão
```http
PUT /api/questoes/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "pergunta": "Qual é o resultado de 2 + 2? (Atualizada)",
  "pontuacao": "2.00"
}
```

### Deletar Questão
```http
DELETE /api/questoes/{id}
Authorization: Bearer {token}
```

## 🎯 Gestão de Aplicações

### Listar Aplicações (Professor)
```http
GET /api/aplicacoes?page=1&limit=10&avaliacaoId=1&statusId=2
Authorization: Bearer {token}
```

### Minhas Aplicações (Aluno)
```http
GET /api/aplicacoes/minhas
Authorization: Bearer {token}
```

### Criar Participação (Professor)
```http
POST /api/aplicacoes
Authorization: Bearer {token}
Content-Type: application/json

{
  "avaliacaoId": 1,
  "usuarioId": 5,
  "ano": "2024",
  "escola": "Escola Municipal",
  "turma": "7A",
  "statusAplicacaoId": 1,
  "disponivel": true
}
```

### Iniciar Avaliação (Aluno)
```http
POST /api/aplicacoes/{id}/iniciar
Authorization: Bearer {token}
```

### Responder Questão (Aluno)
```http
POST /api/aplicacoes/{id}/responder
Authorization: Bearer {token}
Content-Type: application/json

{
  "questaoId": 1,
  "questaoAlternativaId": 2,
  "resposta": "Resposta dissertativa aqui",
  "observacoes": "Observações opcionais"
}
```

### Finalizar Avaliação (Aluno)
```http
POST /api/aplicacoes/{id}/finalizar
Authorization: Bearer {token}
```

### Ver Resultado
```http
GET /api/aplicacoes/{id}/resultado
Authorization: Bearer {token}
```

## 📚 Gestão de Disciplinas

### Listar Disciplinas
```http
GET /api/disciplinas
Authorization: Bearer {token}
```

### Criar Disciplina (Admin)
```http
POST /api/disciplinas
Authorization: Bearer {token}
Content-Type: application/json

{
  "descricao": "Matemática",
  "idDisciplinaExterno": "MAT001",
  "status": true
}
```

### Atualizar Disciplina (Admin)
```http
PUT /api/disciplinas/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "descricao": "Matemática Avançada",
  "status": false
}
```

## 📊 Relatórios

### Dashboard
```http
GET /api/relatorios/dashboard
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "resumo_geral": {
    "total_usuarios": 125,
    "total_avaliacoes": 23,
    "total_questoes": 456,
    "total_participacoes": 89,
    "participacoes_concluidas": 67,
    "taxa_conclusao": 75.28
  },
  "usuarios_por_role": {
    "professores": 15,
    "alunos": 105,
    "admins": 5
  }
}
```

### Relatório de Avaliações
```http
GET /api/relatorios/avaliacoes?dataInicio=2024-01-01&dataFim=2024-12-31
Authorization: Bearer {token}
```

### Relatório de Alunos
```http
GET /api/relatorios/alunos
Authorization: Bearer {token}
```

### Relatório de Questões
```http
GET /api/relatorios/questoes
Authorization: Bearer {token}
```

### Exportar Relatórios (Admin)
```http
GET /api/relatorios/export/{tipo}
Authorization: Bearer {token}
```

## 🔧 Endpoints Auxiliares

### Alterar Senha
```http
POST /api/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "senhaAtual": "senha123",
  "novaSenha": "novaSenha456"
}
```

## 📋 Códigos de Status

- **200** - OK
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **422** - Unprocessable Entity
- **500** - Internal Server Error

## 🔐 Autenticação

Todos os endpoints (exceto login e register) requerem autenticação JWT:

```http
Authorization: Bearer {seu_token_jwt}
```

## 🎭 Roles de Usuário

- **ROLE_ADMIN**: Acesso total ao sistema
- **ROLE_PROFESSOR**: Gerenciar avaliações e questões
- **ROLE_ALUNO**: Participar de avaliações

## 📄 Formato de Dados

### Paginação
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

### Erro Padrão
```json
{
  "error": "Mensagem do erro",
  "message": "Detalhes técnicos do erro",
  "details": ["Erro 1", "Erro 2"]
}
```

### Sucesso Padrão
```json
{
  "message": "Operação realizada com sucesso",
  "data": {...}
}
```

---

🎯 **Todos os endpoints estão implementados e funcionais!**

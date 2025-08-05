<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ApiDocController extends AbstractController
{
    #[Route('/api/doc', name: 'api_doc', methods: ['GET'])]
    public function index(): Response
    {
        $html = '
<!DOCTYPE html>
<html>
<head>
    <title>Sistema de Avaliações - API Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { background: #2196F3; color: white; padding: 20px; margin: -40px -40px 40px -40px; }
        .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .method { padding: 3px 8px; border-radius: 3px; color: white; font-weight: bold; }
        .get { background: #4CAF50; }
        .post { background: #2196F3; }
        .put { background: #FF9800; }
        .delete { background: #f44336; }
        .path { font-family: monospace; font-weight: bold; }
        .description { margin-top: 10px; color: #666; }
        code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
        .auth-note { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Sistema de Avaliações - API Documentation</h1>
        <p>API REST para Sistema de Avaliações Educacionais v1.0.0</p>
    </div>

    <div class="auth-note">
        <strong>🔑 Autenticação:</strong> A maioria dos endpoints requer autenticação JWT. 
        Use o endpoint <code>/api/login_check</code> para obter o token e inclua no header: 
        <code>Authorization: Bearer {token}</code>
    </div>

    <h2>📋 Endpoints Disponíveis</h2>

    <div class="endpoint">
        <span class="method post">POST</span> 
        <span class="path">/api/login_check</span>
        <div class="description">Autenticação de usuários - retorna JWT token</div>
        <div><strong>Body:</strong> <code>{"username": "email", "password": "senha"}</code></div>
    </div>

    <div class="endpoint">
        <span class="method post">POST</span> 
        <span class="path">/api/register</span>
        <div class="description">Cadastro de novos usuários</div>
    </div>

    <div class="endpoint">
        <span class="method get">GET</span> 
        <span class="path">/api/usuarios</span>
        <div class="description">Listar todos os usuários (requer auth)</div>
    </div>

    <div class="endpoint">
        <span class="method get">GET</span> 
        <span class="path">/api/usuarios/{id}</span>
        <div class="description">Obter usuário específico (requer auth)</div>
    </div>

    <div class="endpoint">
        <span class="method post">POST</span> 
        <span class="path">/api/usuarios</span>
        <div class="description">Criar novo usuário (requer auth)</div>
    </div>

    <div class="endpoint">
        <span class="method put">PUT</span> 
        <span class="path">/api/usuarios/{id}</span>
        <div class="description">Atualizar usuário (requer auth)</div>
    </div>

    <div class="endpoint">
        <span class="method delete">DELETE</span> 
        <span class="path">/api/usuarios/{id}</span>
        <div class="description">Excluir usuário (requer auth)</div>
    </div>

    <div class="endpoint">
        <span class="method get">GET</span> 
        <span class="path">/api/avaliacoes</span>
        <div class="description">Listar avaliações (requer auth)</div>
    </div>

    <div class="endpoint">
        <span class="method post">POST</span> 
        <span class="path">/api/avaliacoes</span>
        <div class="description">Criar nova avaliação (requer auth)</div>
    </div>

    <div class="endpoint">
        <span class="method get">GET</span> 
        <span class="path">/api/avaliacoes/{id}</span>
        <div class="description">Obter avaliação específica (requer auth)</div>
    </div>

    <div class="endpoint">
        <span class="method get">GET</span> 
        <span class="path">/api/questoes</span>
        <div class="description">Listar questões (requer auth)</div>
    </div>

    <div class="endpoint">
        <span class="method post">POST</span> 
        <span class="path">/api/questoes</span>
        <div class="description">Criar nova questão (requer auth)</div>
    </div>

    <div class="endpoint">
        <span class="method get">GET</span> 
        <span class="path">/api/avaliacao-questoes/avaliacao/{id}</span>
        <div class="description">Listar questões de uma avaliação (requer auth)</div>
    </div>

    <div class="endpoint">
        <span class="method post">POST</span> 
        <span class="path">/api/avaliacao-questoes</span>
        <div class="description">Adicionar questão à avaliação (requer auth)</div>
    </div>

    <div class="endpoint">
        <span class="method get">GET</span> 
        <span class="path">/api/disciplinas</span>
        <div class="description">Listar disciplinas disponíveis (requer auth)</div>
    </div>

    <div class="endpoint">
        <span class="method get">GET</span> 
        <span class="path">/api/relatorios/avaliacao/{id}</span>
        <div class="description">Gerar relatório de avaliação (requer auth)</div>
    </div>

    <h2>🧪 Testando a API</h2>
    <div class="auth-note">
        <p><strong>Credenciais de teste:</strong></p>
        <ul>
            <li><strong>Admin:</strong> admin@sistema.com / admin123</li>
            <li><strong>Professor:</strong> professor@sistema.com / prof123</li>
            <li><strong>Aluno:</strong> aluno@sistema.com / aluno123</li>
        </ul>
        
        <p><strong>Exemplo de login:</strong></p>
        <code>
        curl -X POST http://localhost:8081/api/login_check \\<br>
        &nbsp;&nbsp;-H "Content-Type: application/json" \\<br>
        &nbsp;&nbsp;-d \'{"username":"admin@sistema.com","password":"admin123"}\'
        </code>
    </div>

    <p style="margin-top: 40px; text-align: center; color: #666;">
        <small>Sistema de Avaliações API v1.0.0 - Documentação Básica</small>
    </p>
</body>
</html>';

        return new Response($html);
    }

    #[Route('/api/endpoints', name: 'api_endpoints', methods: ['GET'])]
    public function endpoints(): JsonResponse
    {
        return $this->json([
            'api_info' => [
                'name' => 'Sistema de Avaliações API',
                'version' => '1.0.0',
                'description' => 'API REST para Sistema de Avaliações Educacionais'
            ],
            'endpoints' => [
                'auth' => [
                    'POST /api/login_check' => 'Autenticação de usuários',
                    'POST /api/register' => 'Cadastro de usuários'
                ],
                'usuarios' => [
                    'GET /api/usuarios' => 'Listar usuários',
                    'GET /api/usuarios/{id}' => 'Obter usuário específico',
                    'POST /api/usuarios' => 'Criar usuário',
                    'PUT /api/usuarios/{id}' => 'Atualizar usuário',
                    'DELETE /api/usuarios/{id}' => 'Excluir usuário'
                ],
                'avaliacoes' => [
                    'GET /api/avaliacoes' => 'Listar avaliações',
                    'GET /api/avaliacoes/{id}' => 'Obter avaliação específica',
                    'POST /api/avaliacoes' => 'Criar avaliação',
                    'PUT /api/avaliacoes/{id}' => 'Atualizar avaliação',
                    'DELETE /api/avaliacoes/{id}' => 'Excluir avaliação'
                ],
                'questoes' => [
                    'GET /api/questoes' => 'Listar questões',
                    'GET /api/questoes/{id}' => 'Obter questão específica',
                    'POST /api/questoes' => 'Criar questão',
                    'PUT /api/questoes/{id}' => 'Atualizar questão',
                    'DELETE /api/questoes/{id}' => 'Excluir questão'
                ],
                'avaliacao_questoes' => [
                    'GET /api/avaliacao-questoes/avaliacao/{id}' => 'Questões de uma avaliação',
                    'POST /api/avaliacao-questoes' => 'Adicionar questão à avaliação',
                    'DELETE /api/avaliacao-questoes/{id}' => 'Remover questão da avaliação'
                ]
            ],
            'authentication' => [
                'type' => 'JWT Bearer Token',
                'header' => 'Authorization: Bearer {token}',
                'login_endpoint' => '/api/login_check'
            ],
            'test_credentials' => [
                'admin' => ['email' => 'admin@sistema.com', 'password' => 'admin123'],
                'professor' => ['email' => 'professor@sistema.com', 'password' => 'prof123'],
                'aluno' => ['email' => 'aluno@sistema.com', 'password' => 'aluno123']
            ]
        ]);
    }
}

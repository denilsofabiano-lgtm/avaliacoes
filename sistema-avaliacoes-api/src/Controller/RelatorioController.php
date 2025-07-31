<?php

namespace App\Controller;

use App\Repository\AvaliacaoRepository;
use App\Repository\ParticipanteAvaliacaoRepository;
use App\Repository\QuestaoRepository;
use App\Repository\UsuarioRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/relatorios', name: 'api_relatorios_')]
#[IsGranted('ROLE_PROFESSOR')]
class RelatorioController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/dashboard', name: 'dashboard', methods: ['GET'])]
    public function dashboard(
        UsuarioRepository $usuarioRepository,
        AvaliacaoRepository $avaliacaoRepository,
        QuestaoRepository $questaoRepository,
        ParticipanteAvaliacaoRepository $participanteRepository
    ): JsonResponse {
        try {
            $totalUsuarios = $usuarioRepository->count(['status' => true]);
            $totalAvaliacoes = $avaliacaoRepository->count([]);
            $totalQuestoes = $questaoRepository->count([]);
            $totalParticipacoes = $participanteRepository->count([]);
            $participacoesConcluidas = $participanteRepository->count(['avaliado' => true]);

            // Estatísticas por role
            $professores = count($usuarioRepository->findByRole('ROLE_PROFESSOR'));
            $alunos = count($usuarioRepository->findByRole('ROLE_ALUNO'));
            $admins = count($usuarioRepository->findByRole('ROLE_ADMIN'));

            return $this->json([
                'resumo_geral' => [
                    'total_usuarios' => $totalUsuarios,
                    'total_avaliacoes' => $totalAvaliacoes,
                    'total_questoes' => $totalQuestoes,
                    'total_participacoes' => $totalParticipacoes,
                    'participacoes_concluidas' => $participacoesConcluidas,
                    'taxa_conclusao' => $totalParticipacoes > 0 ? round(($participacoesConcluidas / $totalParticipacoes) * 100, 2) : 0
                ],
                'usuarios_por_role' => [
                    'professores' => $professores,
                    'alunos' => $alunos,
                    'admins' => $admins
                ]
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao gerar relatório do dashboard',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/avaliacoes', name: 'avaliacoes', methods: ['GET'])]
    public function relatorioAvaliacoes(Request $request): JsonResponse
    {
        try {
            $dataInicio = $request->query->get('dataInicio');
            $dataFim = $request->query->get('dataFim');

            $sql = "
                SELECT 
                    a.id,
                    a.instrucao,
                    ta.descricao as tipo_avaliacao,
                    u.nome as responsavel,
                    COUNT(pa.id) as total_participantes,
                    SUM(CASE WHEN pa.avaliado = true THEN 1 ELSE 0 END) as finalizados,
                    AVG(CASE WHEN ar.correta = true THEN 100.0 ELSE 0.0 END) as media_percentual
                FROM avaliacoes a
                LEFT JOIN tipos_avaliacao ta ON a.tipo_avaliacao_id = ta.id
                LEFT JOIN usuarios u ON a.responsavel_id = u.id
                LEFT JOIN participante_avaliacao pa ON a.id = pa.avaliacao_id
                LEFT JOIN avaliacao_respostas ar ON pa.id = ar.participante_id
                WHERE 1=1
            ";

            $params = [];

            if ($dataInicio) {
                $sql .= " AND a.data_cadastro >= :dataInicio";
                $params['dataInicio'] = $dataInicio;
            }

            if ($dataFim) {
                $sql .= " AND a.data_cadastro <= :dataFim";
                $params['dataFim'] = $dataFim;
            }

            $sql .= " GROUP BY a.id, a.instrucao, ta.descricao, u.nome ORDER BY a.data_cadastro DESC";

            $stmt = $this->entityManager->getConnection()->prepare($sql);
            $result = $stmt->executeQuery($params);

            return $this->json([
                'data' => $result->fetchAllAssociative()
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao gerar relatório de avaliações',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/alunos', name: 'alunos', methods: ['GET'])]
    public function relatorioAlunos(Request $request): JsonResponse
    {
        try {
            $sql = "
                SELECT 
                    u.id,
                    u.nome,
                    u.email,
                    COUNT(DISTINCT pa.id) as total_avaliacoes,
                    SUM(CASE WHEN pa.avaliado = true THEN 1 ELSE 0 END) as avaliacoes_concluidas,
                    AVG(CASE WHEN ar.correta = true THEN 100.0 ELSE 0.0 END) as media_geral,
                    MAX(pa.data_fim) as ultima_avaliacao
                FROM usuarios u
                LEFT JOIN participante_avaliacao pa ON u.id = pa.usuario_id
                LEFT JOIN avaliacao_respostas ar ON pa.id = ar.participante_id
                WHERE JSON_CONTAINS(u.roles, '\"ROLE_ALUNO\"')
                GROUP BY u.id, u.nome, u.email
                ORDER BY u.nome ASC
            ";

            $stmt = $this->entityManager->getConnection()->prepare($sql);
            $result = $stmt->executeQuery();

            return $this->json([
                'data' => $result->fetchAllAssociative()
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao gerar relatório de alunos',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/questoes', name: 'questoes', methods: ['GET'])]
    public function relatorioQuestoes(): JsonResponse
    {
        try {
            $sql = "
                SELECT 
                    q.id,
                    LEFT(q.pergunta, 100) as pergunta,
                    d.descricao as disciplina,
                    nd.descricao as nivel_dificuldade,
                    COUNT(ar.id) as total_respostas,
                    SUM(CASE WHEN ar.correta = true THEN 1 ELSE 0 END) as respostas_corretas,
                    CASE 
                        WHEN COUNT(ar.id) > 0 THEN 
                            ROUND((SUM(CASE WHEN ar.correta = true THEN 1 ELSE 0 END) * 100.0 / COUNT(ar.id)), 2)
                        ELSE 0 
                    END as indice_acerto
                FROM questoes q
                LEFT JOIN disciplinas d ON q.disciplina_id = d.id
                LEFT JOIN niveis_dificuldade nd ON q.nivel_dificuldade_id = nd.id
                LEFT JOIN avaliacao_respostas ar ON q.id = ar.questao_id
                GROUP BY q.id, q.pergunta, d.descricao, nd.descricao
                ORDER BY indice_acerto ASC
            ";

            $stmt = $this->entityManager->getConnection()->prepare($sql);
            $result = $stmt->executeQuery();

            return $this->json([
                'data' => $result->fetchAllAssociative()
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao gerar relatório de questões',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/export/{tipo}', name: 'export', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function export(string $tipo, Request $request): JsonResponse
    {
        // Implementar exportação para CSV/Excel
        return $this->json([
            'message' => 'Funcionalidade de exportação em desenvolvimento',
            'tipo' => $tipo
        ], Response::HTTP_NOT_IMPLEMENTED);
    }
}

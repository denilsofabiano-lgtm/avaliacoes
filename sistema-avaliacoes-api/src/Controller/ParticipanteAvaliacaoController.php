<?php

namespace App\Controller;

use App\Entity\ParticipanteAvaliacao;
use App\Repository\ParticipanteAvaliacaoRepository;
use App\Repository\AvaliacaoRepository;
use App\Repository\UsuarioRepository;
use App\Repository\StatusAplicacaoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/aplicacoes', name: 'api_aplicacoes_')]
#[IsGranted('ROLE_PROFESSOR')]
class ParticipanteAvaliacaoController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request, ParticipanteAvaliacaoRepository $participanteRepository): JsonResponse
    {
        try {
            $page = max(1, $request->query->getInt('page', 1));
            $limit = min(100, max(1, $request->query->getInt('limit', 10)));
            $search = $request->query->get('search', '');
            $avaliacaoId = $request->query->get('avaliacaoId');
            $statusAplicacaoId = $request->query->get('statusAplicacaoId');
            $escola = $request->query->get('escola');
            $turma = $request->query->get('turma');

            $criteria = [];
            if ($avaliacaoId) {
                $criteria['avaliacao'] = $avaliacaoId;
            }
            if ($statusAplicacaoId) {
                $criteria['statusAplicacao'] = $statusAplicacaoId;
            }
            if ($escola) {
                $criteria['escola'] = $escola;
            }
            if ($turma) {
                $criteria['turma'] = $turma;
            }

            $participantes = $participanteRepository->findByFilters($criteria, $search, $page, $limit);
            $total = $participanteRepository->countByFilters($criteria, $search);

            return $this->json([
                'data' => json_decode($this->serializer->serialize($participantes, 'json', ['groups' => ['participante:list']])),
                'pagination' => [
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit,
                    'pages' => ceil($total / $limit)
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao buscar aplicações',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id, ParticipanteAvaliacaoRepository $participanteRepository): JsonResponse
    {
        $participante = $participanteRepository->find($id);

        if (!$participante) {
            return $this->json(['error' => 'Aplicação não encontrada'], Response::HTTP_NOT_FOUND);
        }

        return $this->json(
            json_decode($this->serializer->serialize($participante, 'json', ['groups' => ['participante:read']])),
            Response::HTTP_OK
        );
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(
        Request $request,
        AvaliacaoRepository $avaliacaoRepository,
        UsuarioRepository $usuarioRepository,
        StatusAplicacaoRepository $statusAplicacaoRepository
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);

            if (!isset($data['participantes']) || !is_array($data['participantes'])) {
                return $this->json(['error' => 'Lista de participantes é obrigatória'], Response::HTTP_BAD_REQUEST);
            }

            $avaliacao = $avaliacaoRepository->find($data['avaliacaoId']);
            if (!$avaliacao) {
                return $this->json(['error' => 'Avaliação não encontrada'], Response::HTTP_BAD_REQUEST);
            }

            $statusPendente = $statusAplicacaoRepository->findOneBy(['descricao' => 'Pendente']);
            if (!$statusPendente) {
                return $this->json(['error' => 'Status padrão não encontrado'], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            $participantesCriados = [];

            foreach ($data['participantes'] as $participanteData) {
                $usuario = $usuarioRepository->find($participanteData['usuarioId']);
                if (!$usuario) {
                    continue; // Pular usuários não encontrados
                }

                // Verificar se já existe participante para esta avaliação e usuário
                $existente = $this->entityManager->getRepository(ParticipanteAvaliacao::class)
                    ->findOneBy(['avaliacao' => $avaliacao, 'usuario' => $usuario]);

                if ($existente) {
                    continue; // Pular se já existe
                }

                $participante = new ParticipanteAvaliacao();
                $participante->setAvaliacao($avaliacao);
                $participante->setUsuario($usuario);
                $participante->setAno($participanteData['ano'] ?? date('Y'));
                $participante->setEscola($participanteData['escola'] ?? '');
                $participante->setTurma($participanteData['turma'] ?? '');
                $participante->setDisponivel($participanteData['disponivel'] ?? true);
                $participante->setDataInicioAvaliacao(
                    isset($participanteData['dataInicioAvaliacao']) 
                        ? new \DateTime($participanteData['dataInicioAvaliacao']) 
                        : new \DateTime()
                );
                $participante->setStatusAplicacao($statusPendente);
                $participante->setAvaliado(false);

                $this->entityManager->persist($participante);
                $participantesCriados[] = $participante;
            }

            if (empty($participantesCriados)) {
                return $this->json([
                    'error' => 'Nenhum participante válido encontrado'
                ], Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Aplicação criada com sucesso',
                'total_participantes' => count($participantesCriados),
                'participantes' => json_decode($this->serializer->serialize($participantesCriados, 'json', ['groups' => ['participante:read']]))
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao criar aplicação',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'], requirements: ['id' => '\d+'])]
    public function update(
        int $id,
        Request $request,
        ParticipanteAvaliacaoRepository $participanteRepository,
        StatusAplicacaoRepository $statusAplicacaoRepository
    ): JsonResponse {
        $participante = $participanteRepository->find($id);

        if (!$participante) {
            return $this->json(['error' => 'Aplicação não encontrada'], Response::HTTP_NOT_FOUND);
        }

        try {
            $data = json_decode($request->getContent(), true);

            if (isset($data['escola'])) {
                $participante->setEscola($data['escola']);
            }

            if (isset($data['turma'])) {
                $participante->setTurma($data['turma']);
            }

            if (isset($data['ano'])) {
                $participante->setAno($data['ano']);
            }

            if (isset($data['disponivel'])) {
                $participante->setDisponivel((bool) $data['disponivel']);
            }

            if (isset($data['dataInicioAvaliacao'])) {
                $participante->setDataInicioAvaliacao(new \DateTime($data['dataInicioAvaliacao']));
            }

            if (isset($data['statusAplicacaoId'])) {
                $status = $statusAplicacaoRepository->find($data['statusAplicacaoId']);
                if ($status) {
                    $participante->setStatusAplicacao($status);
                }
            }

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Aplicação atualizada com sucesso',
                'participante' => json_decode($this->serializer->serialize($participante, 'json', ['groups' => ['participante:read']]))
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao atualizar aplicação',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id, ParticipanteAvaliacaoRepository $participanteRepository): JsonResponse
    {
        $participante = $participanteRepository->find($id);

        if (!$participante) {
            return $this->json(['error' => 'Aplicação não encontrada'], Response::HTTP_NOT_FOUND);
        }

        try {
            $this->entityManager->remove($participante);
            $this->entityManager->flush();

            return $this->json(['message' => 'Aplicação removida com sucesso'], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao remover aplicação',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/toggle-disponibilidade', name: 'toggle_disponibilidade', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function toggleDisponibilidade(int $id, ParticipanteAvaliacaoRepository $participanteRepository): JsonResponse
    {
        $participante = $participanteRepository->find($id);

        if (!$participante) {
            return $this->json(['error' => 'Aplicação não encontrada'], Response::HTTP_NOT_FOUND);
        }

        try {
            $participante->setDisponivel(!$participante->isDisponivel());
            $this->entityManager->flush();

            $status = $participante->isDisponivel() ? 'liberada' : 'bloqueada';

            return $this->json([
                'message' => "Aplicação {$status} com sucesso",
                'disponivel' => $participante->isDisponivel()
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao alterar disponibilidade',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/reset', name: 'reset', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function reset(
        int $id,
        ParticipanteAvaliacaoRepository $participanteRepository,
        StatusAplicacaoRepository $statusAplicacaoRepository
    ): JsonResponse {
        $participante = $participanteRepository->find($id);

        if (!$participante) {
            return $this->json(['error' => 'Aplicação não encontrada'], Response::HTTP_NOT_FOUND);
        }

        try {
            // Resetar para status pendente
            $statusPendente = $statusAplicacaoRepository->findOneBy(['descricao' => 'Pendente']);
            if ($statusPendente) {
                $participante->setStatusAplicacao($statusPendente);
            }

            // Limpar datas e status
            $participante->setDataInicio(null);
            $participante->setDataFim(null);
            $participante->setAvaliado(false);

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Aplicação resetada com sucesso',
                'participante' => json_decode($this->serializer->serialize($participante, 'json', ['groups' => ['participante:read']]))
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao resetar aplicação',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/estatisticas', name: 'statistics', methods: ['GET'])]
    public function statistics(ParticipanteAvaliacaoRepository $participanteRepository): JsonResponse
    {
        try {
            $stats = [
                'total' => $participanteRepository->count([]),
                'pendentes' => $participanteRepository->countByStatus('Pendente'),
                'em_andamento' => $participanteRepository->countByStatus('Em Andamento'),
                'concluidas' => $participanteRepository->countByStatus('Concluído'),
                'disponiveis' => $participanteRepository->count(['disponivel' => true]),
                'bloqueadas' => $participanteRepository->count(['disponivel' => false])
            ];

            return $this->json($stats);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao calcular estatísticas',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

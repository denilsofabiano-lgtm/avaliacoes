<?php

namespace App\Controller;

use App\Entity\ParticipanteAvaliacao;
use App\Entity\AvaliacaoResposta;
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
class AplicacaoController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    #[IsGranted('ROLE_PROFESSOR')]
    public function list(Request $request, ParticipanteAvaliacaoRepository $participanteRepository): JsonResponse
    {
        try {
            $page = max(1, $request->query->getInt('page', 1));
            $limit = min(100, max(1, $request->query->getInt('limit', 10)));
            $search = $request->query->get('search', '');
            $avaliacaoId = $request->query->get('avaliacaoId');
            $statusId = $request->query->get('statusId');

            $criteria = [];
            if ($avaliacaoId) {
                $criteria['avaliacao'] = $avaliacaoId;
            }
            if ($statusId) {
                $criteria['statusAplicacao'] = $statusId;
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

    #[Route('/minhas', name: 'minhas', methods: ['GET'])]
    #[IsGranted('ROLE_ALUNO')]
    public function minhasAplicacoes(ParticipanteAvaliacaoRepository $participanteRepository): JsonResponse
    {
        try {
            $user = $this->getUser();
            $participacoes = $participanteRepository->findBy(
                ['usuario' => $user, 'disponivel' => true],
                ['dataCadastro' => 'DESC']
            );

            return $this->json(
                json_decode($this->serializer->serialize($participacoes, 'json', ['groups' => ['participante:read']])),
                Response::HTTP_OK
            );

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao buscar suas aplicações',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_PROFESSOR')]
    public function create(
        Request $request,
        AvaliacaoRepository $avaliacaoRepository,
        UsuarioRepository $usuarioRepository,
        StatusAplicacaoRepository $statusRepository
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);

            $avaliacao = $avaliacaoRepository->find($data['avaliacaoId']);
            if (!$avaliacao) {
                return $this->json(['error' => 'Avaliação não encontrada'], Response::HTTP_BAD_REQUEST);
            }

            $usuario = $usuarioRepository->find($data['usuarioId']);
            if (!$usuario) {
                return $this->json(['error' => 'Usuário não encontrado'], Response::HTTP_BAD_REQUEST);
            }

            $status = $statusRepository->find($data['statusAplicacaoId'] ?? 1); // Pendente por padrão

            $participante = new ParticipanteAvaliacao();
            $participante->setAvaliacao($avaliacao);
            $participante->setUsuario($usuario);
            $participante->setStatusAplicacao($status);
            $participante->setAno($data['ano'] ?? date('Y'));
            $participante->setEscola($data['escola'] ?? '');
            $participante->setTurma($data['turma'] ?? '');
            $participante->setDisponivel($data['disponivel'] ?? true);
            $participante->setDataInicioAvaliacao($data['dataInicioAvaliacao'] ? new \DateTime($data['dataInicioAvaliacao']) : null);

            $this->entityManager->persist($participante);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Participante adicionado com sucesso',
                'participante' => json_decode($this->serializer->serialize($participante, 'json', ['groups' => ['participante:read']]))
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao criar aplicação',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/iniciar', name: 'iniciar', methods: ['POST'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ALUNO')]
    public function iniciar(int $id, ParticipanteAvaliacaoRepository $participanteRepository): JsonResponse
    {
        $participante = $participanteRepository->find($id);

        if (!$participante) {
            return $this->json(['error' => 'Participação não encontrada'], Response::HTTP_NOT_FOUND);
        }

        if ($participante->getUsuario() !== $this->getUser()) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        if (!$participante->isDisponivel()) {
            return $this->json(['error' => 'Avaliação não disponível'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $participante->setDataInicio(new \DateTime());
            $participante->setHoraInicio(new \DateTime());
            
            // Atualizar status para "Iniciado"
            $statusIniciado = $this->entityManager->getRepository(\App\Entity\StatusAplicacao::class)->find(2);
            if ($statusIniciado) {
                $participante->setStatusAplicacao($statusIniciado);
            }

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Avaliação iniciada com sucesso',
                'participante' => json_decode($this->serializer->serialize($participante, 'json', ['groups' => ['participante:read']]))
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao iniciar avaliação',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/finalizar', name: 'finalizar', methods: ['POST'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ALUNO')]
    public function finalizar(int $id, ParticipanteAvaliacaoRepository $participanteRepository): JsonResponse
    {
        $participante = $participanteRepository->find($id);

        if (!$participante) {
            return $this->json(['error' => 'Participação não encontrada'], Response::HTTP_NOT_FOUND);
        }

        if ($participante->getUsuario() !== $this->getUser()) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        try {
            $participante->setDataFim(new \DateTime());
            $participante->setHoraFim(new \DateTime());
            $participante->setAvaliado(true);
            
            // Atualizar status para "Concluído"
            $statusConcluido = $this->entityManager->getRepository(\App\Entity\StatusAplicacao::class)->find(3);
            if ($statusConcluido) {
                $participante->setStatusAplicacao($statusConcluido);
            }

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Avaliação finalizada com sucesso',
                'participante' => json_decode($this->serializer->serialize($participante, 'json', ['groups' => ['participante:read']]))
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao finalizar avaliação',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/responder', name: 'responder', methods: ['POST'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ALUNO')]
    public function responder(int $id, Request $request, ParticipanteAvaliacaoRepository $participanteRepository): JsonResponse
    {
        $participante = $participanteRepository->find($id);

        if (!$participante) {
            return $this->json(['error' => 'Participação não encontrada'], Response::HTTP_NOT_FOUND);
        }

        if ($participante->getUsuario() !== $this->getUser()) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        try {
            $data = json_decode($request->getContent(), true);

            $questao = $this->entityManager->getRepository(\App\Entity\Questao::class)->find($data['questaoId']);
            if (!$questao) {
                return $this->json(['error' => 'Questão não encontrada'], Response::HTTP_BAD_REQUEST);
            }

            // Verificar se já existe resposta para esta questão
            $respostaExistente = $this->entityManager
                ->getRepository(AvaliacaoResposta::class)
                ->findOneBy(['participante' => $participante, 'questao' => $questao]);

            if ($respostaExistente) {
                // Atualizar resposta existente
                $resposta = $respostaExistente;
            } else {
                // Criar nova resposta
                $resposta = new AvaliacaoResposta();
                $resposta->setParticipante($participante);
                $resposta->setUsuario($this->getUser());
                $resposta->setQuestao($questao);
            }

            $resposta->setResposta($data['resposta'] ?? null);

            // Se for alternativa múltipla
            if (isset($data['questaoAlternativaId'])) {
                $alternativa = $this->entityManager
                    ->getRepository(\App\Entity\QuestaoAlternativa::class)
                    ->find($data['questaoAlternativaId']);
                
                if ($alternativa) {
                    $resposta->setQuestaoAlternativa($alternativa);
                    $resposta->setCorreta($alternativa->isCorreta());
                }
            }

            $resposta->setObservacoes($data['observacoes'] ?? null);

            if (!$respostaExistente) {
                $this->entityManager->persist($resposta);
            }
            
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Resposta salva com sucesso',
                'resposta' => json_decode($this->serializer->serialize($resposta, 'json', ['groups' => ['resposta:read']]))
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao salvar resposta',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/resultado', name: 'resultado', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function resultado(int $id, ParticipanteAvaliacaoRepository $participanteRepository): JsonResponse
    {
        $participante = $participanteRepository->find($id);

        if (!$participante) {
            return $this->json(['error' => 'Participação não encontrada'], Response::HTTP_NOT_FOUND);
        }

        // Verificar permissão
        if (!$this->isGranted('ROLE_PROFESSOR') && $participante->getUsuario() !== $this->getUser()) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        try {
            $respostas = $participante->getRespostas();
            $totalQuestoes = $participante->getAvaliacao()->getTotalQuestoes();
            $respostasCorretas = 0;
            $pontuacaoTotal = 0;

            foreach ($respostas as $resposta) {
                if ($resposta->isCorreta()) {
                    $respostasCorretas++;
                }
                if ($resposta->getPontuacao()) {
                    $pontuacaoTotal += (float) $resposta->getPontuacao();
                }
            }

            $percentualAcerto = $totalQuestoes > 0 ? ($respostasCorretas / $totalQuestoes) * 100 : 0;

            return $this->json([
                'participante' => json_decode($this->serializer->serialize($participante, 'json', ['groups' => ['participante:read']])),
                'respostas' => json_decode($this->serializer->serialize($respostas->toArray(), 'json', ['groups' => ['resposta:read']])),
                'estatisticas' => [
                    'total_questoes' => $totalQuestoes,
                    'questoes_respondidas' => $respostas->count(),
                    'questoes_corretas' => $respostasCorretas,
                    'percentual_acerto' => round($percentualAcerto, 2),
                    'pontuacao_total' => $pontuacaoTotal,
                    'tempo_decorrido' => $participante->getTempoDecorrido()
                ]
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao buscar resultado',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

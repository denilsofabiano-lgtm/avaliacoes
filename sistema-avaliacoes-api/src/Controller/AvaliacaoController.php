<?php

namespace App\Controller;

use App\Entity\Avaliacao;
use App\Entity\AvaliacaoQuestao;
use App\Repository\AvaliacaoRepository;
use App\Repository\QuestaoRepository;
use App\Repository\TipoAvaliacaoRepository;
use App\Repository\StatusAvaliacaoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/avaliacoes', name: 'api_avaliacoes_')]
#[IsGranted('ROLE_PROFESSOR')]
class AvaliacaoController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request, AvaliacaoRepository $avaliacaoRepository): JsonResponse
    {
        try {
            $page = max(1, $request->query->getInt('page', 1));
            $limit = min(100, max(1, $request->query->getInt('limit', 10)));
            $search = $request->query->get('search', '');
            $tipoAvaliacaoId = $request->query->get('tipoAvaliacaoId');
            $statusAvaliacaoId = $request->query->get('statusAvaliacaoId');
            $responsavelId = $request->query->get('responsavelId');

            $criteria = [];
            if ($tipoAvaliacaoId) {
                $criteria['tipoAvaliacao'] = $tipoAvaliacaoId;
            }
            if ($statusAvaliacaoId) {
                $criteria['statusAvaliacao'] = $statusAvaliacaoId;
            }
            if ($responsavelId) {
                $criteria['responsavel'] = $responsavelId;
            }

            // Se não for admin, mostrar apenas suas próprias avaliações
            if (!$this->isGranted('ROLE_ADMIN')) {
                $criteria['responsavel'] = $this->getUser()->getId();
            }

            $avaliacoes = $avaliacaoRepository->findByFilters($criteria, $search, $page, $limit);
            $total = $avaliacaoRepository->countByFilters($criteria, $search);

            return $this->json([
                'data' => json_decode($this->serializer->serialize($avaliacoes, 'json', ['groups' => ['avaliacao:list']])),
                'pagination' => [
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit,
                    'pages' => ceil($total / $limit)
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao buscar avaliações',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id, AvaliacaoRepository $avaliacaoRepository): JsonResponse
    {
        $avaliacao = $avaliacaoRepository->find($id);

        if (!$avaliacao) {
            return $this->json(['error' => 'Avaliação não encontrada'], Response::HTTP_NOT_FOUND);
        }

        // Verificar permissão
        if (!$this->isGranted('ROLE_ADMIN') && $avaliacao->getResponsavel() !== $this->getUser()) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        return $this->json(
            json_decode($this->serializer->serialize($avaliacao, 'json', ['groups' => ['avaliacao:read']])),
            Response::HTTP_OK
        );
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(
        Request $request,
        TipoAvaliacaoRepository $tipoAvaliacaoRepository,
        StatusAvaliacaoRepository $statusAvaliacaoRepository
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);

            $avaliacao = new Avaliacao();
            $avaliacao->setInstrucao($data['instrucao'] ?? '');
            $avaliacao->setResponsavel($this->getUser());

            // Tipo de avaliação
            if (isset($data['tipoAvaliacaoId'])) {
                $tipoAvaliacao = $tipoAvaliacaoRepository->find($data['tipoAvaliacaoId']);
                if (!$tipoAvaliacao) {
                    return $this->json(['error' => 'Tipo de avaliação não encontrado'], Response::HTTP_BAD_REQUEST);
                }
                $avaliacao->setTipoAvaliacao($tipoAvaliacao);
            }

            // Status da avaliação
            if (isset($data['statusAvaliacaoId'])) {
                $statusAvaliacao = $statusAvaliacaoRepository->find($data['statusAvaliacaoId']);
                if (!$statusAvaliacao) {
                    return $this->json(['error' => 'Status da avaliação não encontrado'], Response::HTTP_BAD_REQUEST);
                }
                $avaliacao->setStatusAvaliacao($statusAvaliacao);
            }

            // Validação
            $errors = $this->validator->validate($avaliacao);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[] = $error->getMessage();
                }
                return $this->json([
                    'error' => 'Dados inválidos',
                    'details' => $errorMessages
                ], Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->persist($avaliacao);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Avaliação criada com sucesso',
                'avaliacao' => json_decode($this->serializer->serialize($avaliacao, 'json', ['groups' => ['avaliacao:read']]))
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao criar avaliação',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'], requirements: ['id' => '\d+'])]
    public function update(
        int $id,
        Request $request,
        AvaliacaoRepository $avaliacaoRepository,
        TipoAvaliacaoRepository $tipoAvaliacaoRepository,
        StatusAvaliacaoRepository $statusAvaliacaoRepository
    ): JsonResponse {
        $avaliacao = $avaliacaoRepository->find($id);

        if (!$avaliacao) {
            return $this->json(['error' => 'Avaliação não encontrada'], Response::HTTP_NOT_FOUND);
        }

        // Verificar permissão
        if (!$this->isGranted('ROLE_ADMIN') && $avaliacao->getResponsavel() !== $this->getUser()) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        try {
            $data = json_decode($request->getContent(), true);

            if (isset($data['instrucao'])) {
                $avaliacao->setInstrucao($data['instrucao']);
            }

            if (isset($data['tipoAvaliacaoId'])) {
                $tipoAvaliacao = $tipoAvaliacaoRepository->find($data['tipoAvaliacaoId']);
                if (!$tipoAvaliacao) {
                    return $this->json(['error' => 'Tipo de avaliação não encontrado'], Response::HTTP_BAD_REQUEST);
                }
                $avaliacao->setTipoAvaliacao($tipoAvaliacao);
            }

            if (isset($data['statusAvaliacaoId'])) {
                $statusAvaliacao = $statusAvaliacaoRepository->find($data['statusAvaliacaoId']);
                if (!$statusAvaliacao) {
                    return $this->json(['error' => 'Status da avaliação não encontrado'], Response::HTTP_BAD_REQUEST);
                }
                $avaliacao->setStatusAvaliacao($statusAvaliacao);
            }

            // Validação
            $errors = $this->validator->validate($avaliacao);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[] = $error->getMessage();
                }
                return $this->json([
                    'error' => 'Dados inválidos',
                    'details' => $errorMessages
                ], Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Avaliação atualizada com sucesso',
                'avaliacao' => json_decode($this->serializer->serialize($avaliacao, 'json', ['groups' => ['avaliacao:read']]))
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao atualizar avaliação',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id, AvaliacaoRepository $avaliacaoRepository): JsonResponse
    {
        $avaliacao = $avaliacaoRepository->find($id);

        if (!$avaliacao) {
            return $this->json(['error' => 'Avaliação não encontrada'], Response::HTTP_NOT_FOUND);
        }

        // Verificar permissão
        if (!$this->isGranted('ROLE_ADMIN') && $avaliacao->getResponsavel() !== $this->getUser()) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        try {
            $this->entityManager->remove($avaliacao);
            $this->entityManager->flush();

            return $this->json(['message' => 'Avaliação removida com sucesso'], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao remover avaliação',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/questoes', name: 'add_questoes', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function addQuestoes(
        int $id,
        Request $request,
        AvaliacaoRepository $avaliacaoRepository,
        QuestaoRepository $questaoRepository
    ): JsonResponse {
        $avaliacao = $avaliacaoRepository->find($id);

        if (!$avaliacao) {
            return $this->json(['error' => 'Avaliação não encontrada'], Response::HTTP_NOT_FOUND);
        }

        // Verificar permissão
        if (!$this->isGranted('ROLE_ADMIN') && $avaliacao->getResponsavel() !== $this->getUser()) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        try {
            $data = json_decode($request->getContent(), true);
            $questoesIds = $data['questoesIds'] ?? [];

            foreach ($questoesIds as $questaoId) {
                $questao = $questaoRepository->find($questaoId);
                if ($questao) {
                    $avaliacaoQuestao = new AvaliacaoQuestao();
                    $avaliacaoQuestao->setAvaliacao($avaliacao);
                    $avaliacaoQuestao->setQuestao($questao);
                    
                    $this->entityManager->persist($avaliacaoQuestao);
                }
            }

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Questões adicionadas com sucesso',
                'total_questoes' => $avaliacao->getTotalQuestoes()
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao adicionar questões',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/questoes/{questaoId}', name: 'remove_questao', methods: ['DELETE'], requirements: ['id' => '\d+', 'questaoId' => '\d+'])]
    public function removeQuestao(
        int $id,
        int $questaoId,
        AvaliacaoRepository $avaliacaoRepository
    ): JsonResponse {
        $avaliacao = $avaliacaoRepository->find($id);

        if (!$avaliacao) {
            return $this->json(['error' => 'Avaliação não encontrada'], Response::HTTP_NOT_FOUND);
        }

        // Verificar permissão
        if (!$this->isGranted('ROLE_ADMIN') && $avaliacao->getResponsavel() !== $this->getUser()) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        try {
            $avaliacaoQuestao = $this->entityManager
                ->getRepository(AvaliacaoQuestao::class)
                ->findOneBy(['avaliacao' => $avaliacao, 'questao' => $questaoId]);

            if ($avaliacaoQuestao) {
                $this->entityManager->remove($avaliacaoQuestao);
                $this->entityManager->flush();
            }

            return $this->json(['message' => 'Questão removida com sucesso'], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao remover questão',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/duplicar', name: 'duplicate', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function duplicate(int $id, AvaliacaoRepository $avaliacaoRepository): JsonResponse
    {
        $avaliacaoOriginal = $avaliacaoRepository->find($id);

        if (!$avaliacaoOriginal) {
            return $this->json(['error' => 'Avaliação não encontrada'], Response::HTTP_NOT_FOUND);
        }

        // Verificar permissão
        if (!$this->isGranted('ROLE_ADMIN') && $avaliacaoOriginal->getResponsavel() !== $this->getUser()) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        try {
            $novaAvaliacao = new Avaliacao();
            $novaAvaliacao->setInstrucao($avaliacaoOriginal->getInstrucao() . ' (Cópia)');
            $novaAvaliacao->setTipoAvaliacao($avaliacaoOriginal->getTipoAvaliacao());
            $novaAvaliacao->setStatusAvaliacao($avaliacaoOriginal->getStatusAvaliacao());
            $novaAvaliacao->setResponsavel($this->getUser());

            $this->entityManager->persist($novaAvaliacao);
            
            // Duplicar questões
            foreach ($avaliacaoOriginal->getAvaliacaoQuestoes() as $avaliacaoQuestao) {
                $novaAvaliacaoQuestao = new AvaliacaoQuestao();
                $novaAvaliacaoQuestao->setAvaliacao($novaAvaliacao);
                $novaAvaliacaoQuestao->setQuestao($avaliacaoQuestao->getQuestao());
                $novaAvaliacaoQuestao->setOrdem($avaliacaoQuestao->getOrdem());
                
                $this->entityManager->persist($novaAvaliacaoQuestao);
            }

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Avaliação duplicada com sucesso',
                'avaliacao' => json_decode($this->serializer->serialize($novaAvaliacao, 'json', ['groups' => ['avaliacao:read']]))
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao duplicar avaliação',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

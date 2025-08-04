<?php

namespace App\Controller;

use App\Entity\AvaliacaoQuestao;
use App\Entity\Avaliacao;
use App\Entity\Questao;
use App\Repository\AvaliacaoQuestaoRepository;
use App\Repository\AvaliacaoRepository;
use App\Repository\QuestaoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/avaliacao-questoes')]
class AvaliacaoQuestaoController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private AvaliacaoQuestaoRepository $avaliacaoQuestaoRepository,
        private AvaliacaoRepository $avaliacaoRepository,
        private QuestaoRepository $questaoRepository
    ) {}

    /**
     * Listar questões de uma avaliação
     */
    #[Route('/avaliacao/{avaliacaoId}', name: 'api_avaliacao_questoes_list', methods: ['GET'])]
    public function list(int $avaliacaoId): JsonResponse
    {
        try {
            $avaliacao = $this->avaliacaoRepository->find($avaliacaoId);
            if (!$avaliacao) {
                return new JsonResponse(['error' => 'Avaliação não encontrada'], Response::HTTP_NOT_FOUND);
            }

            $questoes = $this->avaliacaoQuestaoRepository->findByAvaliacaoOrdered($avaliacao);

            $data = array_map(function(AvaliacaoQuestao $aq) {
                return [
                    'id' => $aq->getId(),
                    'ordem' => $aq->getOrdem(),
                    'dataCadastro' => $aq->getDataCadastro()?->format('Y-m-d H:i:s'),
                    'questao' => [
                        'id' => $aq->getQuestao()->getId(),
                        'pergunta' => $aq->getQuestao()->getPergunta(),
                        'pontuacao' => $aq->getQuestao()->getPontuacao(),
                        'disciplina' => [
                            'id' => $aq->getQuestao()->getDisciplina()?->getId(),
                            'descricao' => $aq->getQuestao()->getDisciplina()?->getDescricao()
                        ],
                        'tipoAlternativa' => [
                            'id' => $aq->getQuestao()->getTipoAlternativa()?->getId(),
                            'descricao' => $aq->getQuestao()->getTipoAlternativa()?->getDescricao()
                        ]
                    ]
                ];
            }, $questoes);

            return new JsonResponse([
                'message' => 'Questões listadas com sucesso',
                'data' => $data,
                'total' => count($data)
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erro ao listar questões da avaliação',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Listar questões disponíveis para adicionar à avaliação
     */
    #[Route('/avaliacao/{avaliacaoId}/disponiveis', name: 'api_avaliacao_questoes_disponiveis', methods: ['GET'])]
    public function questoesDisponiveis(int $avaliacaoId): JsonResponse
    {
        try {
            $avaliacao = $this->avaliacaoRepository->find($avaliacaoId);
            if (!$avaliacao) {
                return new JsonResponse(['error' => 'Avaliação não encontrada'], Response::HTTP_NOT_FOUND);
            }

            $questoes = $this->avaliacaoQuestaoRepository->findQuestoesDisponiveis($avaliacao);

            $data = array_map(function(Questao $questao) {
                return [
                    'id' => $questao->getId(),
                    'pergunta' => $questao->getPergunta(),
                    'pontuacao' => $questao->getPontuacao(),
                    'disciplina' => [
                        'id' => $questao->getDisciplina()?->getId(),
                        'descricao' => $questao->getDisciplina()?->getDescricao()
                    ],
                    'tipoAlternativa' => [
                        'id' => $questao->getTipoAlternativa()?->getId(),
                        'descricao' => $questao->getTipoAlternativa()?->getDescricao()
                    ],
                    'nivelDificuldade' => [
                        'id' => $questao->getNivelDificuldade()?->getId(),
                        'descricao' => $questao->getNivelDificuldade()?->getDescricao()
                    ]
                ];
            }, $questoes);

            return new JsonResponse([
                'message' => 'Questões disponíveis listadas com sucesso',
                'data' => $data,
                'total' => count($data)
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erro ao listar questões disponíveis',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Adicionar questão à avaliação
     */
    #[Route('', name: 'api_avaliacao_questoes_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!isset($data['avaliacaoId']) || !isset($data['questaoId'])) {
                return new JsonResponse([
                    'error' => 'Dados obrigatórios: avaliacaoId, questaoId'
                ], Response::HTTP_BAD_REQUEST);
            }

            $avaliacao = $this->avaliacaoRepository->find($data['avaliacaoId']);
            if (!$avaliacao) {
                return new JsonResponse(['error' => 'Avaliação não encontrada'], Response::HTTP_NOT_FOUND);
            }

            $questao = $this->questaoRepository->find($data['questaoId']);
            if (!$questao) {
                return new JsonResponse(['error' => 'Questão não encontrada'], Response::HTTP_NOT_FOUND);
            }

            // Verificar se a questão já está vinculada
            if ($this->avaliacaoQuestaoRepository->isQuestaoVinculada($avaliacao, $questao)) {
                return new JsonResponse([
                    'error' => 'Questão já está vinculada a esta avaliação'
                ], Response::HTTP_CONFLICT);
            }

            // Criar nova relação
            $avaliacaoQuestao = new AvaliacaoQuestao();
            $avaliacaoQuestao->setAvaliacao($avaliacao);
            $avaliacaoQuestao->setQuestao($questao);
            
            // Definir ordem (manual ou automática)
            $ordem = $data['ordem'] ?? $this->avaliacaoQuestaoRepository->getProximaOrdem($avaliacao);
            $avaliacaoQuestao->setOrdem($ordem);

            $this->entityManager->persist($avaliacaoQuestao);
            $this->entityManager->flush();

            return new JsonResponse([
                'message' => 'Questão adicionada à avaliação com sucesso',
                'data' => [
                    'id' => $avaliacaoQuestao->getId(),
                    'ordem' => $avaliacaoQuestao->getOrdem(),
                    'questao' => [
                        'id' => $questao->getId(),
                        'pergunta' => $questao->getPergunta()
                    ]
                ]
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erro ao adicionar questão à avaliação',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remover questão da avaliação
     */
    #[Route('/{id}', name: 'api_avaliacao_questoes_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        try {
            $avaliacaoQuestao = $this->avaliacaoQuestaoRepository->find($id);
            if (!$avaliacaoQuestao) {
                return new JsonResponse(['error' => 'Relação não encontrada'], Response::HTTP_NOT_FOUND);
            }

            $this->entityManager->remove($avaliacaoQuestao);
            $this->entityManager->flush();

            return new JsonResponse([
                'message' => 'Questão removida da avaliação com sucesso'
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erro ao remover questão da avaliação',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Atualizar ordem das questões
     */
    #[Route('/avaliacao/{avaliacaoId}/reordenar', name: 'api_avaliacao_questoes_reordenar', methods: ['PUT'])]
    public function reordenar(int $avaliacaoId, Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!isset($data['ordens']) || !is_array($data['ordens'])) {
                return new JsonResponse([
                    'error' => 'Dados obrigatórios: ordens (array com questaoId => ordem)'
                ], Response::HTTP_BAD_REQUEST);
            }

            $avaliacao = $this->avaliacaoRepository->find($avaliacaoId);
            if (!$avaliacao) {
                return new JsonResponse(['error' => 'Avaliação não encontrada'], Response::HTTP_NOT_FOUND);
            }

            $this->avaliacaoQuestaoRepository->atualizarOrdens($avaliacao, $data['ordens']);

            return new JsonResponse([
                'message' => 'Ordem das questões atualizada com sucesso'
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erro ao reordenar questões',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Adicionar múltiplas questões à avaliação
     */
    #[Route('/avaliacao/{avaliacaoId}/adicionar-multiplas', name: 'api_avaliacao_questoes_add_multiple', methods: ['POST'])]
    public function adicionarMultiplas(int $avaliacaoId, Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!isset($data['questoesIds']) || !is_array($data['questoesIds'])) {
                return new JsonResponse([
                    'error' => 'Dados obrigatórios: questoesIds (array de IDs)'
                ], Response::HTTP_BAD_REQUEST);
            }

            $avaliacao = $this->avaliacaoRepository->find($avaliacaoId);
            if (!$avaliacao) {
                return new JsonResponse(['error' => 'Avaliação não encontrada'], Response::HTTP_NOT_FOUND);
            }

            $adicionadas = 0;
            $erros = [];

            foreach ($data['questoesIds'] as $questaoId) {
                $questao = $this->questaoRepository->find($questaoId);
                if (!$questao) {
                    $erros[] = "Questão ID $questaoId não encontrada";
                    continue;
                }

                if ($this->avaliacaoQuestaoRepository->isQuestaoVinculada($avaliacao, $questao)) {
                    $erros[] = "Questão ID $questaoId já está vinculada";
                    continue;
                }

                $avaliacaoQuestao = new AvaliacaoQuestao();
                $avaliacaoQuestao->setAvaliacao($avaliacao);
                $avaliacaoQuestao->setQuestao($questao);
                $avaliacaoQuestao->setOrdem($this->avaliacaoQuestaoRepository->getProximaOrdem($avaliacao));

                $this->entityManager->persist($avaliacaoQuestao);
                $adicionadas++;
            }

            $this->entityManager->flush();

            return new JsonResponse([
                'message' => "Processo concluído: $adicionadas questões adicionadas",
                'adicionadas' => $adicionadas,
                'erros' => $erros
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erro ao adicionar múltiplas questões',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

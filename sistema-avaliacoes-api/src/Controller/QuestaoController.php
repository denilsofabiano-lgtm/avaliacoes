<?php

namespace App\Controller;

use App\Entity\Questao;
use App\Entity\QuestaoAlternativa;
use App\Repository\QuestaoRepository;
use App\Repository\DisciplinaRepository;
use App\Repository\TipoAlternativaRepository;
use App\Repository\NivelDificuldadeRepository;
use App\Repository\StatusQuestaoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/questoes', name: 'api_questoes_')]
#[IsGranted('ROLE_PROFESSOR')]
class QuestaoController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request, QuestaoRepository $questaoRepository): JsonResponse
    {
        try {
            $page = max(1, $request->query->getInt('page', 1));
            $limit = min(100, max(1, $request->query->getInt('limit', 10)));
            $search = $request->query->get('search', '');
            $disciplinaId = $request->query->get('disciplinaId');
            $nivelDificuldadeId = $request->query->get('nivelDificuldadeId');
            $tipoAlternativaId = $request->query->get('tipoAlternativaId');

            $criteria = [];
            if ($disciplinaId) {
                $criteria['disciplina'] = $disciplinaId;
            }
            if ($nivelDificuldadeId) {
                $criteria['nivelDificuldade'] = $nivelDificuldadeId;
            }
            if ($tipoAlternativaId) {
                $criteria['tipoAlternativa'] = $tipoAlternativaId;
            }

            $questoes = $questaoRepository->findByFilters($criteria, $search, $page, $limit);
            $total = $questaoRepository->countByFilters($criteria, $search);

            return $this->json([
                'data' => json_decode($this->serializer->serialize($questoes, 'json', ['groups' => ['questao:list']])),
                'pagination' => [
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit,
                    'pages' => ceil($total / $limit)
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao buscar questões',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id, QuestaoRepository $questaoRepository): JsonResponse
    {
        $questao = $questaoRepository->find($id);

        if (!$questao) {
            return $this->json(['error' => 'Questão não encontrada'], Response::HTTP_NOT_FOUND);
        }

        return $this->json(
            json_decode($this->serializer->serialize($questao, 'json', ['groups' => ['questao:read']])),
            Response::HTTP_OK
        );
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(
        Request $request,
        DisciplinaRepository $disciplinaRepository,
        TipoAlternativaRepository $tipoAlternativaRepository,
        NivelDificuldadeRepository $nivelDificuldadeRepository,
        StatusQuestaoRepository $statusQuestaoRepository
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);

            $questao = new Questao();
            $questao->setPergunta($data['pergunta']);
            $questao->setGeradorIa($data['geradorIa'] ?? false);
            $questao->setPontuacao($data['pontuacao'] ?? null);
            $questao->setRespostaCorreta($data['respostaCorreta'] ?? null);
            $questao->setCiclo($data['ciclo'] ?? null);
            $questao->setFase($data['fase'] ?? null);
            $questao->setTema($data['tema'] ?? null);
            $questao->setHabilidades($data['habilidades'] ?? null);

            // Disciplina
            if (isset($data['disciplinaId'])) {
                $disciplina = $disciplinaRepository->find($data['disciplinaId']);
                if ($disciplina) {
                    $questao->setDisciplina($disciplina);
                }
            }

            // Tipo de alternativa
            if (isset($data['tipoAlternativaId'])) {
                $tipoAlternativa = $tipoAlternativaRepository->find($data['tipoAlternativaId']);
                if (!$tipoAlternativa) {
                    return $this->json(['error' => 'Tipo de alternativa não encontrado'], Response::HTTP_BAD_REQUEST);
                }
                $questao->setTipoAlternativa($tipoAlternativa);
            }

            // Nível de dificuldade
            if (isset($data['nivelDificuldadeId'])) {
                $nivelDificuldade = $nivelDificuldadeRepository->find($data['nivelDificuldadeId']);
                if ($nivelDificuldade) {
                    $questao->setNivelDificuldade($nivelDificuldade);
                }
            }

            // Status da questão
            if (isset($data['statusQuestaoId'])) {
                $statusQuestao = $statusQuestaoRepository->find($data['statusQuestaoId']);
                if (!$statusQuestao) {
                    return $this->json(['error' => 'Status da questão não encontrado'], Response::HTTP_BAD_REQUEST);
                }
                $questao->setStatusQuestao($statusQuestao);
            }

            // Validação
            $errors = $this->validator->validate($questao);
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

            $this->entityManager->persist($questao);

            // Adicionar alternativas
            if (isset($data['alternativas']) && is_array($data['alternativas'])) {
                foreach ($data['alternativas'] as $altData) {
                    $alternativa = new QuestaoAlternativa();
                    $alternativa->setQuestao($questao);
                    $alternativa->setAlternativa($altData['alternativa']);
                    $alternativa->setConteudo($altData['conteudo']);
                    $alternativa->setCorreta($altData['correta'] ?? false);
                    
                    $this->entityManager->persist($alternativa);
                }
            }

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Questão criada com sucesso',
                'questao' => json_decode($this->serializer->serialize($questao, 'json', ['groups' => ['questao:read']]))
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao criar questão',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'], requirements: ['id' => '\d+'])]
    public function update(
        int $id,
        Request $request,
        QuestaoRepository $questaoRepository,
        DisciplinaRepository $disciplinaRepository,
        TipoAlternativaRepository $tipoAlternativaRepository,
        NivelDificuldadeRepository $nivelDificuldadeRepository,
        StatusQuestaoRepository $statusQuestaoRepository
    ): JsonResponse {
        $questao = $questaoRepository->find($id);

        if (!$questao) {
            return $this->json(['error' => 'Questão não encontrada'], Response::HTTP_NOT_FOUND);
        }

        try {
            $data = json_decode($request->getContent(), true);

            if (isset($data['pergunta'])) {
                $questao->setPergunta($data['pergunta']);
            }

            if (isset($data['geradorIa'])) {
                $questao->setGeradorIa($data['geradorIa']);
            }

            if (isset($data['pontuacao'])) {
                $questao->setPontuacao($data['pontuacao']);
            }

            if (isset($data['respostaCorreta'])) {
                $questao->setRespostaCorreta($data['respostaCorreta']);
            }

            if (isset($data['ciclo'])) {
                $questao->setCiclo($data['ciclo']);
            }

            if (isset($data['fase'])) {
                $questao->setFase($data['fase']);
            }

            if (isset($data['tema'])) {
                $questao->setTema($data['tema']);
            }

            if (isset($data['habilidades'])) {
                $questao->setHabilidades($data['habilidades']);
            }

            // Atualizar relacionamentos se fornecidos
            if (isset($data['disciplinaId'])) {
                $disciplina = $disciplinaRepository->find($data['disciplinaId']);
                $questao->setDisciplina($disciplina);
            }

            if (isset($data['tipoAlternativaId'])) {
                $tipoAlternativa = $tipoAlternativaRepository->find($data['tipoAlternativaId']);
                if (!$tipoAlternativa) {
                    return $this->json(['error' => 'Tipo de alternativa não encontrado'], Response::HTTP_BAD_REQUEST);
                }
                $questao->setTipoAlternativa($tipoAlternativa);
            }

            if (isset($data['nivelDificuldadeId'])) {
                $nivelDificuldade = $nivelDificuldadeRepository->find($data['nivelDificuldadeId']);
                $questao->setNivelDificuldade($nivelDificuldade);
            }

            if (isset($data['statusQuestaoId'])) {
                $statusQuestao = $statusQuestaoRepository->find($data['statusQuestaoId']);
                if (!$statusQuestao) {
                    return $this->json(['error' => 'Status da questão não encontrado'], Response::HTTP_BAD_REQUEST);
                }
                $questao->setStatusQuestao($statusQuestao);
            }

            // Atualizar alternativas se fornecidas
            if (isset($data['alternativas']) && is_array($data['alternativas'])) {
                // Remover alternativas existentes
                foreach ($questao->getAlternativas() as $alternativa) {
                    $this->entityManager->remove($alternativa);
                }

                // Adicionar novas alternativas
                foreach ($data['alternativas'] as $altData) {
                    $alternativa = new QuestaoAlternativa();
                    $alternativa->setQuestao($questao);
                    $alternativa->setAlternativa($altData['alternativa']);
                    $alternativa->setConteudo($altData['conteudo']);
                    $alternativa->setCorreta($altData['correta'] ?? false);
                    
                    $this->entityManager->persist($alternativa);
                }
            }

            // Validação
            $errors = $this->validator->validate($questao);
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
                'message' => 'Questão atualizada com sucesso',
                'questao' => json_decode($this->serializer->serialize($questao, 'json', ['groups' => ['questao:read']]))
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao atualizar questão',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id, QuestaoRepository $questaoRepository): JsonResponse
    {
        $questao = $questaoRepository->find($id);

        if (!$questao) {
            return $this->json(['error' => 'Questão não encontrada'], Response::HTTP_NOT_FOUND);
        }

        try {
            $this->entityManager->remove($questao);
            $this->entityManager->flush();

            return $this->json(['message' => 'Questão removida com sucesso'], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao remover questão',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/import', name: 'import', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function import(Request $request): JsonResponse
    {
        // Implementar importação de questões em lote
        return $this->json(['message' => 'Funcionalidade de importação em desenvolvimento'], Response::HTTP_NOT_IMPLEMENTED);
    }

    #[Route('/export', name: 'export', methods: ['GET'])]
    public function export(Request $request): JsonResponse
    {
        // Implementar exportação de questões
        return $this->json(['message' => 'Funcionalidade de exportação em desenvolvimento'], Response::HTTP_NOT_IMPLEMENTED);
    }
}

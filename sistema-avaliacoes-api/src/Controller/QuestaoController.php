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
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
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
            $tipoAlternativaId = $request->query->get('tipoAlternativaId');
            $nivelDificuldadeId = $request->query->get('nivelDificuldadeId');
            $ciclo = $request->query->get('ciclo');
            $fase = $request->query->get('fase');
            $geradorIa = $request->query->get('geradorIa');

            $criteria = [];
            if ($disciplinaId) {
                $criteria['disciplina'] = $disciplinaId;
            }
            if ($tipoAlternativaId) {
                $criteria['tipoAlternativa'] = $tipoAlternativaId;
            }
            if ($nivelDificuldadeId) {
                $criteria['nivelDificuldade'] = $nivelDificuldadeId;
            }
            if ($ciclo) {
                $criteria['ciclo'] = $ciclo;
            }
            if ($fase) {
                $criteria['fase'] = $fase;
            }
            if ($geradorIa !== null) {
                $criteria['geradorIa'] = filter_var($geradorIa, FILTER_VALIDATE_BOOLEAN);
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
            $questao->setPergunta($data['pergunta'] ?? '');
            $questao->setTema($data['tema'] ?? null);
            $questao->setPontuacao($data['pontuacao'] ?? 0);
            $questao->setCiclo($data['ciclo'] ?? null);
            $questao->setFase($data['fase'] ?? null);
            $questao->setHabilidades($data['habilidades'] ?? null);
            $questao->setGeradorIa($data['geradorIa'] ?? false);

            // Disciplina
            if (isset($data['disciplinaId'])) {
                $disciplina = $disciplinaRepository->find($data['disciplinaId']);
                if (!$disciplina) {
                    return $this->json(['error' => 'Disciplina não encontrada'], Response::HTTP_BAD_REQUEST);
                }
                $questao->setDisciplina($disciplina);
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
                if (!$nivelDificuldade) {
                    return $this->json(['error' => 'Nível de dificuldade não encontrado'], Response::HTTP_BAD_REQUEST);
                }
                $questao->setNivelDificuldade($nivelDificuldade);
            }

            // Status padrão
            $statusQuestao = $statusQuestaoRepository->findOneBy(['descricao' => 'Ativa']);
            if ($statusQuestao) {
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

            // Adicionar alternativas se fornecidas
            if (isset($data['alternativas']) && is_array($data['alternativas'])) {
                foreach ($data['alternativas'] as $altData) {
                    $alternativa = new QuestaoAlternativa();
                    $alternativa->setQuestao($questao);
                    $alternativa->setAlternativa($altData['alternativa'] ?? '');
                    $alternativa->setConteudo($altData['conteudo'] ?? '');
                    $alternativa->setCorreta($altData['correta'] ?? false);
                    
                    $this->entityManager->persist($alternativa);
                }
            }

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Questão criada com sucesso',
                'data' => json_decode($this->serializer->serialize($questao, 'json', ['groups' => ['questao:read']]))
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
        NivelDificuldadeRepository $nivelDificuldadeRepository
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

            if (isset($data['tema'])) {
                $questao->setTema($data['tema']);
            }

            if (isset($data['pontuacao'])) {
                $questao->setPontuacao($data['pontuacao']);
            }

            if (isset($data['ciclo'])) {
                $questao->setCiclo($data['ciclo']);
            }

            if (isset($data['fase'])) {
                $questao->setFase($data['fase']);
            }

            if (isset($data['habilidades'])) {
                $questao->setHabilidades($data['habilidades']);
            }

            if (isset($data['disciplinaId'])) {
                $disciplina = $disciplinaRepository->find($data['disciplinaId']);
                if (!$disciplina) {
                    return $this->json(['error' => 'Disciplina não encontrada'], Response::HTTP_BAD_REQUEST);
                }
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
                if (!$nivelDificuldade) {
                    return $this->json(['error' => 'Nível de dificuldade não encontrado'], Response::HTTP_BAD_REQUEST);
                }
                $questao->setNivelDificuldade($nivelDificuldade);
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
                'data' => json_decode($this->serializer->serialize($questao, 'json', ['groups' => ['questao:read']]))
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

    #[Route('/{id}/duplicar', name: 'duplicate', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function duplicate(int $id, QuestaoRepository $questaoRepository): JsonResponse
    {
        $questaoOriginal = $questaoRepository->find($id);

        if (!$questaoOriginal) {
            return $this->json(['error' => 'Questão não encontrada'], Response::HTTP_NOT_FOUND);
        }

        try {
            $novaQuestao = new Questao();
            $novaQuestao->setPergunta('Cópia de: ' . $questaoOriginal->getPergunta());
            $novaQuestao->setTema($questaoOriginal->getTema());
            $novaQuestao->setPontuacao($questaoOriginal->getPontuacao());
            $novaQuestao->setCiclo($questaoOriginal->getCiclo());
            $novaQuestao->setFase($questaoOriginal->getFase());
            $novaQuestao->setHabilidades($questaoOriginal->getHabilidades());
            $novaQuestao->setGeradorIa($questaoOriginal->isGeradorIa());
            $novaQuestao->setDisciplina($questaoOriginal->getDisciplina());
            $novaQuestao->setTipoAlternativa($questaoOriginal->getTipoAlternativa());
            $novaQuestao->setNivelDificuldade($questaoOriginal->getNivelDificuldade());
            $novaQuestao->setStatusQuestao($questaoOriginal->getStatusQuestao());

            $this->entityManager->persist($novaQuestao);

            // Duplicar alternativas
            foreach ($questaoOriginal->getQuestaoAlternativas() as $alternativaOriginal) {
                $novaAlternativa = new QuestaoAlternativa();
                $novaAlternativa->setQuestao($novaQuestao);
                $novaAlternativa->setAlternativa($alternativaOriginal->getAlternativa());
                $novaAlternativa->setConteudo($alternativaOriginal->getConteudo());
                $novaAlternativa->setCorreta($alternativaOriginal->isCorreta());
                
                $this->entityManager->persist($novaAlternativa);
            }

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Questão duplicada com sucesso',
                'data' => json_decode($this->serializer->serialize($novaQuestao, 'json', ['groups' => ['questao:read']]))
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao duplicar questão',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/problema', name: 'report_problem', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function reportProblem(int $id, Request $request, QuestaoRepository $questaoRepository): JsonResponse
    {
        $questao = $questaoRepository->find($id);

        if (!$questao) {
            return $this->json(['error' => 'Questão não encontrada'], Response::HTTP_NOT_FOUND);
        }

        try {
            $data = json_decode($request->getContent(), true);
            $descricao = $data['descricao'] ?? '';

            if (empty($descricao)) {
                return $this->json(['error' => 'Descrição do problema é obrigatória'], Response::HTTP_BAD_REQUEST);
            }

            // Aqui você poderia salvar o problema em uma tabela específica ou enviar email
            // Por agora, apenas logar o problema
            error_log("Problema reportado na questão {$id}: {$descricao}");

            return $this->json(['message' => 'Problema reportado com sucesso'], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao reportar problema',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/import', name: 'import', methods: ['POST'])]
    public function import(Request $request): JsonResponse
    {
        $uploadedFile = $request->files->get('file');

        if (!$uploadedFile) {
            return $this->json(['error' => 'Nenhum arquivo foi enviado'], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Aqui você implementaria a lógica de importação
            // Por exemplo, leitura de arquivo Excel/CSV/JSON e criação das questões
            
            return $this->json([
                'message' => 'Arquivo recebido com sucesso. Importação em desenvolvimento.',
                'filename' => $uploadedFile->getClientOriginalName(),
                'size' => $uploadedFile->getSize()
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao processar importação',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/export', name: 'export', methods: ['GET'])]
    public function export(Request $request, QuestaoRepository $questaoRepository): Response
    {
        try {
            // Aplicar os mesmos filtros da listagem
            $disciplinaId = $request->query->get('disciplinaId');
            $tipoAlternativaId = $request->query->get('tipoAlternativaId');
            $nivelDificuldadeId = $request->query->get('nivelDificuldadeId');
            $ciclo = $request->query->get('ciclo');
            $fase = $request->query->get('fase');
            $geradorIa = $request->query->get('geradorIa');
            $search = $request->query->get('search', '');

            $criteria = [];
            if ($disciplinaId) $criteria['disciplina'] = $disciplinaId;
            if ($tipoAlternativaId) $criteria['tipoAlternativa'] = $tipoAlternativaId;
            if ($nivelDificuldadeId) $criteria['nivelDificuldade'] = $nivelDificuldadeId;
            if ($ciclo) $criteria['ciclo'] = $ciclo;
            if ($fase) $criteria['fase'] = $fase;
            if ($geradorIa !== null) $criteria['geradorIa'] = filter_var($geradorIa, FILTER_VALIDATE_BOOLEAN);

            $questoes = $questaoRepository->findByFilters($criteria, $search);

            $data = json_encode(
                json_decode($this->serializer->serialize($questoes, 'json', ['groups' => ['questao:export']])),
                JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
            );

            $response = new Response($data);
            $response->headers->set('Content-Type', 'application/json');
            $response->headers->set('Content-Disposition', 
                $response->headers->makeDisposition(
                    ResponseHeaderBag::DISPOSITION_ATTACHMENT,
                    'questoes-' . date('Y-m-d') . '.json'
                )
            );

            return $response;

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao exportar questões',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

<?php

namespace App\Controller;

use App\Entity\Disciplina;
use App\Repository\DisciplinaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/disciplinas', name: 'api_disciplinas_')]
#[IsGranted('ROLE_PROFESSOR')]
class DisciplinaController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(DisciplinaRepository $disciplinaRepository): JsonResponse
    {
        $disciplinas = $disciplinaRepository->findBy(['status' => true], ['descricao' => 'ASC']);
        
        return $this->json(
            json_decode($this->serializer->serialize($disciplinas, 'json', ['groups' => ['disciplina:read']])),
            Response::HTTP_OK
        );
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            $disciplina = new Disciplina();
            $disciplina->setDescricao($data['descricao']);
            $disciplina->setIdDisciplinaExterno($data['idDisciplinaExterno'] ?? null);
            $disciplina->setStatus($data['status'] ?? true);

            $errors = $this->validator->validate($disciplina);
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

            $this->entityManager->persist($disciplina);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Disciplina criada com sucesso',
                'disciplina' => json_decode($this->serializer->serialize($disciplina, 'json', ['groups' => ['disciplina:read']]))
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao criar disciplina',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(int $id, Request $request, DisciplinaRepository $disciplinaRepository): JsonResponse
    {
        $disciplina = $disciplinaRepository->find($id);

        if (!$disciplina) {
            return $this->json(['error' => 'Disciplina não encontrada'], Response::HTTP_NOT_FOUND);
        }

        try {
            $data = json_decode($request->getContent(), true);

            if (isset($data['descricao'])) {
                $disciplina->setDescricao($data['descricao']);
            }

            if (isset($data['idDisciplinaExterno'])) {
                $disciplina->setIdDisciplinaExterno($data['idDisciplinaExterno']);
            }

            if (isset($data['status'])) {
                $disciplina->setStatus($data['status']);
            }

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Disciplina atualizada com sucesso',
                'disciplina' => json_decode($this->serializer->serialize($disciplina, 'json', ['groups' => ['disciplina:read']]))
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao atualizar disciplina',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

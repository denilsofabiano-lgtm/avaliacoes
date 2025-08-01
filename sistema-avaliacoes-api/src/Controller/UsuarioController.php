<?php

namespace App\Controller;

use App\Entity\Usuario;
use App\Repository\UsuarioRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/usuarios', name: 'api_usuarios_')]
#[IsGranted('ROLE_ADMIN')]
class UsuarioController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request, UsuarioRepository $usuarioRepository): JsonResponse
    {
        try {
            $page = max(1, $request->query->getInt('page', 1));
            $limit = min(100, max(1, $request->query->getInt('limit', 10)));
            $search = $request->query->get('search', '');
            $status = $request->query->get('status');

            $criteria = [];
            if ($status !== null) {
                $criteria['status'] = (bool) $status;
            }

            $usuarios = $usuarioRepository->findByFilters($criteria, $search, $page, $limit);
            $total = $usuarioRepository->countByFilters($criteria, $search);

            return $this->json([
                'data' => json_decode($this->serializer->serialize($usuarios, 'json', ['groups' => ['usuario:list']])),
                'pagination' => [
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit,
                    'pages' => ceil($total / $limit)
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao buscar usuários',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id, UsuarioRepository $usuarioRepository): JsonResponse
    {
        $usuario = $usuarioRepository->find($id);

        if (!$usuario) {
            return $this->json(['error' => 'Usuário não encontrado'], Response::HTTP_NOT_FOUND);
        }

        return $this->json(
            json_decode($this->serializer->serialize($usuario, 'json', ['groups' => ['usuario:read']])),
            Response::HTTP_OK
        );
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request, UsuarioRepository $usuarioRepository): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            // Verificar se e-mail já existe
            if ($usuarioRepository->findOneBy(['email' => $data['email']])) {
                return $this->json(['error' => 'E-mail já cadastrado'], Response::HTTP_CONFLICT);
            }

            // Verificar se CPF já existe
            if ($usuarioRepository->findOneBy(['cpf' => $data['cpf']])) {
                return $this->json(['error' => 'CPF já cadastrado'], Response::HTTP_CONFLICT);
            }

            $usuario = new Usuario();
            $usuario->setNome($data['nome']);
            $usuario->setEmail($data['email']);
            $usuario->setCpf($data['cpf']);
            $usuario->setRoles($data['roles'] ?? ['ROLE_ALUNO']);
            $usuario->setStatus($data['status'] ?? true);

            // Hash da senha
            $senha = $data['senha'] ?? $this->generateRandomPassword();
            $hashedPassword = $this->passwordHasher->hashPassword($usuario, $senha);
            $usuario->setSenha($hashedPassword);

            // Validação
            $errors = $this->validator->validate($usuario);
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

            $this->entityManager->persist($usuario);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Usuário criado com sucesso',
                'usuario' => json_decode($this->serializer->serialize($usuario, 'json', ['groups' => ['usuario:read']])),
                'senha_temporaria' => !isset($data['senha']) ? $senha : null
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao criar usuário',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request, UsuarioRepository $usuarioRepository): JsonResponse
    {
        $usuario = $usuarioRepository->find($id);

        if (!$usuario) {
            return $this->json(['error' => 'Usuário não encontrado'], Response::HTTP_NOT_FOUND);
        }

        try {
            $data = json_decode($request->getContent(), true);

            if (isset($data['nome'])) {
                $usuario->setNome($data['nome']);
            }

            if (isset($data['email']) && $data['email'] !== $usuario->getEmail()) {
                // Verificar se novo e-mail já existe
                if ($usuarioRepository->findOneBy(['email' => $data['email']])) {
                    return $this->json(['error' => 'E-mail já cadastrado'], Response::HTTP_CONFLICT);
                }
                $usuario->setEmail($data['email']);
            }

            if (isset($data['cpf']) && $data['cpf'] !== $usuario->getCpf()) {
                // Verificar se novo CPF já existe
                if ($usuarioRepository->findOneBy(['cpf' => $data['cpf']])) {
                    return $this->json(['error' => 'CPF já cadastrado'], Response::HTTP_CONFLICT);
                }
                $usuario->setCpf($data['cpf']);
            }

            if (isset($data['roles'])) {
                $usuario->setRoles($data['roles']);
            }

            if (isset($data['status'])) {
                $usuario->setStatus((bool) $data['status']);
            }

            if (isset($data['senha']) && !empty($data['senha'])) {
                $hashedPassword = $this->passwordHasher->hashPassword($usuario, $data['senha']);
                $usuario->setSenha($hashedPassword);
            }

            // Validação
            $errors = $this->validator->validate($usuario);
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
                'message' => 'Usuário atualizado com sucesso',
                'usuario' => json_decode($this->serializer->serialize($usuario, 'json', ['groups' => ['usuario:read']]))
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao atualizar usuário',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id, UsuarioRepository $usuarioRepository): JsonResponse
    {
        $usuario = $usuarioRepository->find($id);

        if (!$usuario) {
            return $this->json(['error' => 'Usuário não encontrado'], Response::HTTP_NOT_FOUND);
        }

        try {
            // Em vez de deletar, vamos apenas desativar o usuário
            $usuario->setStatus(false);
            $this->entityManager->flush();

            return $this->json(['message' => 'Usuário desativado com sucesso'], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao desativar usuário',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/reativar', name: 'reactivate', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function reactivate(int $id, UsuarioRepository $usuarioRepository): JsonResponse
    {
        $usuario = $usuarioRepository->find($id);

        if (!$usuario) {
            return $this->json(['error' => 'Usuário não encontrado'], Response::HTTP_NOT_FOUND);
        }

        try {
            $usuario->setStatus(true);
            $this->entityManager->flush();

            return $this->json(['message' => 'Usuário reativado com sucesso'], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao reativar usuário',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/reset-password', name: 'reset_password', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function resetPassword(int $id, UsuarioRepository $usuarioRepository): JsonResponse
    {
        $usuario = $usuarioRepository->find($id);

        if (!$usuario) {
            return $this->json(['error' => 'Usuário não encontrado'], Response::HTTP_NOT_FOUND);
        }

        try {
            $novaSenha = $this->generateRandomPassword();
            $hashedPassword = $this->passwordHasher->hashPassword($usuario, $novaSenha);
            $usuario->setSenha($hashedPassword);

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Senha resetada com sucesso',
                'senha_temporaria' => $novaSenha
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao resetar senha',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/toggle-status', name: 'toggle_status', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function toggleStatus(int $id, UsuarioRepository $usuarioRepository): JsonResponse
    {
        $usuario = $usuarioRepository->find($id);

        if (!$usuario) {
            return $this->json(['error' => 'Usuário não encontrado'], Response::HTTP_NOT_FOUND);
        }

        try {
            $usuario->setStatus(!$usuario->isStatus());
            $this->entityManager->flush();

            $action = $usuario->isStatus() ? 'ativado' : 'desativado';

            return $this->json([
                'message' => "Usuário {$action} com sucesso",
                'status' => $usuario->isStatus()
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro ao alterar status do usuário',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function generateRandomPassword(int $length = 8): string
    {
        $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
        $password = '';
        for ($i = 0; $i < $length; $i++) {
            $password .= $characters[random_int(0, strlen($characters) - 1)];
        }
        return $password;
    }
}

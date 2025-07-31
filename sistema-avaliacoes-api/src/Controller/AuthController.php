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
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api', name: 'api_')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request, UsuarioRepository $usuarioRepository): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            // Verificar se e-mail já existe
            if ($usuarioRepository->findOneBy(['email' => $data['email']])) {
                return $this->json([
                    'error' => 'E-mail já cadastrado'
                ], Response::HTTP_CONFLICT);
            }

            // Verificar se CPF já existe
            if ($usuarioRepository->findOneBy(['cpf' => $data['cpf']])) {
                return $this->json([
                    'error' => 'CPF já cadastrado'
                ], Response::HTTP_CONFLICT);
            }

            $usuario = new Usuario();
            $usuario->setNome($data['nome']);
            $usuario->setEmail($data['email']);
            $usuario->setCpf($data['cpf']);
            $usuario->setRoles($data['roles'] ?? ['ROLE_ALUNO']);
            $usuario->setStatus($data['status'] ?? true);

            // Hash da senha
            $hashedPassword = $this->passwordHasher->hashPassword($usuario, $data['senha']);
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
                'usuario' => $this->serializer->serialize($usuario, 'json', ['groups' => ['usuario:read']])
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro interno do servidor',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/profile', name: 'profile', methods: ['GET'])]
    public function profile(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof Usuario) {
            return $this->json(['error' => 'Usuário não encontrado'], Response::HTTP_NOT_FOUND);
        }

        return $this->json(
            $this->serializer->serialize($user, 'json', ['groups' => ['usuario:read']]),
            Response::HTTP_OK,
            [],
            true
        );
    }

    #[Route('/profile', name: 'profile_update', methods: ['PUT', 'PATCH'])]
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof Usuario) {
            return $this->json(['error' => 'Usuário não encontrado'], Response::HTTP_NOT_FOUND);
        }

        try {
            $data = json_decode($request->getContent(), true);

            if (isset($data['nome'])) {
                $user->setNome($data['nome']);
            }

            if (isset($data['email'])) {
                $user->setEmail($data['email']);
            }

            if (isset($data['senha']) && !empty($data['senha'])) {
                $hashedPassword = $this->passwordHasher->hashPassword($user, $data['senha']);
                $user->setSenha($hashedPassword);
            }

            // Validação
            $errors = $this->validator->validate($user);
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
                'message' => 'Perfil atualizado com sucesso',
                'usuario' => $this->serializer->serialize($user, 'json', ['groups' => ['usuario:read']])
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro interno do servidor',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/change-password', name: 'change_password', methods: ['POST'])]
    public function changePassword(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof Usuario) {
            return $this->json(['error' => 'Usuário não encontrado'], Response::HTTP_NOT_FOUND);
        }

        try {
            $data = json_decode($request->getContent(), true);

            // Verificar senha atual
            if (!$this->passwordHasher->isPasswordValid($user, $data['senhaAtual'])) {
                return $this->json(['error' => 'Senha atual incorreta'], Response::HTTP_BAD_REQUEST);
            }

            // Alterar para nova senha
            $hashedPassword = $this->passwordHasher->hashPassword($user, $data['novaSenha']);
            $user->setSenha($hashedPassword);

            $this->entityManager->flush();

            return $this->json(['message' => 'Senha alterada com sucesso'], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erro interno do servidor',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

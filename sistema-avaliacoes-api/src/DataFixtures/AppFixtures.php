<?php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use App\Entity\Usuario;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Criar usuário Admin
        $admin = new Usuario();
        $admin->setNome('Administrador Sistema');
        $admin->setEmail('admin@sistema.com');
        $admin->setCpf('12345678901');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setStatus(true);
        $admin->setDataCadastro(new \DateTime());
        
        $hashedPassword = $this->passwordHasher->hashPassword($admin, 'admin123');
        $admin->setSenha($hashedPassword);
        
        $manager->persist($admin);

        // Criar usuário Professor
        $professor = new Usuario();
        $professor->setNome('Professor Demo');
        $professor->setEmail('professor@sistema.com');
        $professor->setCpf('98765432109');
        $professor->setRoles(['ROLE_PROFESSOR']);
        $professor->setStatus(true);
        $professor->setDataCadastro(new \DateTime());
        
        $hashedPassword = $this->passwordHasher->hashPassword($professor, 'prof123');
        $professor->setSenha($hashedPassword);
        
        $manager->persist($professor);

        // Criar usuário Aluno
        $aluno = new Usuario();
        $aluno->setNome('Aluno Demo');
        $aluno->setEmail('aluno@sistema.com');
        $aluno->setCpf('11122233344');
        $aluno->setRoles(['ROLE_ALUNO']);
        $aluno->setStatus(true);
        $aluno->setDataCadastro(new \DateTime());
        
        $hashedPassword = $this->passwordHasher->hashPassword($aluno, 'aluno123');
        $aluno->setSenha($hashedPassword);
        
        $manager->persist($aluno);

        // Criar alguns usuários adicionais
        for ($i = 1; $i <= 10; $i++) {
            $usuario = new Usuario();
            $usuario->setNome("Usuário Demo {$i}");
            $usuario->setEmail("usuario{$i}@sistema.com");
            $usuario->setCpf(str_pad((string)(11111111111 + $i), 11, '0', STR_PAD_LEFT));
            $usuario->setRoles($i % 2 == 0 ? ['ROLE_PROFESSOR'] : ['ROLE_ALUNO']);
            $usuario->setStatus($i % 3 != 0); // Alguns inativo para demonstração
            $usuario->setDataCadastro(new \DateTime("-{$i} days"));
            
            $hashedPassword = $this->passwordHasher->hashPassword($usuario, 'demo123');
            $usuario->setSenha($hashedPassword);
            
            $manager->persist($usuario);
        }

        $manager->flush();
    }
}

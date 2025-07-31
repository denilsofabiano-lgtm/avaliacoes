<?php

namespace App\Repository;

use App\Entity\Usuario;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;

/**
 * @extends ServiceEntityRepository<Usuario>
 */
class UsuarioRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Usuario::class);
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof Usuario) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', $user::class));
        }

        $user->setSenha($newHashedPassword);
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    /**
     * Busca usuários com filtros
     */
    public function findByFilters(array $criteria, string $search = '', int $page = 1, int $limit = 10): array
    {
        $qb = $this->createQueryBuilder('u');

        // Aplicar critérios
        foreach ($criteria as $field => $value) {
            $qb->andWhere("u.{$field} = :{$field}")
               ->setParameter($field, $value);
        }

        // Aplicar busca
        if (!empty($search)) {
            $qb->andWhere('(u.nome LIKE :search OR u.email LIKE :search OR u.cpf LIKE :search)')
               ->setParameter('search', "%{$search}%");
        }

        return $qb->orderBy('u.nome', 'ASC')
                  ->setFirstResult(($page - 1) * $limit)
                  ->setMaxResults($limit)
                  ->getQuery()
                  ->getResult();
    }

    /**
     * Conta usuários com filtros
     */
    public function countByFilters(array $criteria, string $search = ''): int
    {
        $qb = $this->createQueryBuilder('u')
                   ->select('COUNT(u.id)');

        // Aplicar critérios
        foreach ($criteria as $field => $value) {
            $qb->andWhere("u.{$field} = :{$field}")
               ->setParameter($field, $value);
        }

        // Aplicar busca
        if (!empty($search)) {
            $qb->andWhere('(u.nome LIKE :search OR u.email LIKE :search OR u.cpf LIKE :search)')
               ->setParameter('search', "%{$search}%");
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Busca usuários por role
     */
    public function findByRole(string $role): array
    {
        return $this->createQueryBuilder('u')
                    ->andWhere('JSON_CONTAINS(u.roles, :role) = 1')
                    ->setParameter('role', json_encode($role))
                    ->orderBy('u.nome', 'ASC')
                    ->getQuery()
                    ->getResult();
    }

    /**
     * Busca usuários ativos
     */
    public function findAtivos(): array
    {
        return $this->findBy(['status' => true], ['nome' => 'ASC']);
    }
}

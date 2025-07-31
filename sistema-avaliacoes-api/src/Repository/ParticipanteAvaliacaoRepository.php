<?php

namespace App\Repository;

use App\Entity\ParticipanteAvaliacao;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ParticipanteAvaliacao>
 */
class ParticipanteAvaliacaoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ParticipanteAvaliacao::class);
    }

    public function findByFilters(array $criteria, string $search = '', int $page = 1, int $limit = 10): array
    {
        $qb = $this->createQueryBuilder('pa')
                   ->leftJoin('pa.usuario', 'u')
                   ->leftJoin('pa.avaliacao', 'a')
                   ->leftJoin('pa.statusAplicacao', 'sa');

        foreach ($criteria as $field => $value) {
            $qb->andWhere("pa.{$field} = :{$field}")
               ->setParameter($field, $value);
        }

        if (!empty($search)) {
            $qb->andWhere('(u.nome LIKE :search OR u.email LIKE :search OR pa.escola LIKE :search)')
               ->setParameter('search', "%{$search}%");
        }

        return $qb->orderBy('pa.dataCadastro', 'DESC')
                  ->setFirstResult(($page - 1) * $limit)
                  ->setMaxResults($limit)
                  ->getQuery()
                  ->getResult();
    }

    public function countByFilters(array $criteria, string $search = ''): int
    {
        $qb = $this->createQueryBuilder('pa')
                   ->select('COUNT(pa.id)')
                   ->leftJoin('pa.usuario', 'u')
                   ->leftJoin('pa.avaliacao', 'a')
                   ->leftJoin('pa.statusAplicacao', 'sa');

        foreach ($criteria as $field => $value) {
            $qb->andWhere("pa.{$field} = :{$field}")
               ->setParameter($field, $value);
        }

        if (!empty($search)) {
            $qb->andWhere('(u.nome LIKE :search OR u.email LIKE :search OR pa.escola LIKE :search)')
               ->setParameter('search', "%{$search}%");
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function findByUsuario(int $usuarioId): array
    {
        return $this->findBy(['usuario' => $usuarioId], ['dataCadastro' => 'DESC']);
    }

    public function findDisponiveis(int $usuarioId): array
    {
        return $this->findBy([
            'usuario' => $usuarioId,
            'disponivel' => true,
            'avaliado' => false
        ], ['dataCadastro' => 'DESC']);
    }

    public function findConcluidas(int $usuarioId): array
    {
        return $this->findBy([
            'usuario' => $usuarioId,
            'avaliado' => true
        ], ['dataFim' => 'DESC']);
    }
}

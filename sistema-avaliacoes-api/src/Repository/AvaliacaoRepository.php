<?php

namespace App\Repository;

use App\Entity\Avaliacao;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Avaliacao>
 */
class AvaliacaoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Avaliacao::class);
    }

    public function findByFilters(array $criteria, string $search = '', int $page = 1, int $limit = 10): array
    {
        $qb = $this->createQueryBuilder('a')
                   ->leftJoin('a.tipoAvaliacao', 'ta')
                   ->leftJoin('a.statusAvaliacao', 'sa')
                   ->leftJoin('a.responsavel', 'r');

        foreach ($criteria as $field => $value) {
            $qb->andWhere("a.{$field} = :{$field}")
               ->setParameter($field, $value);
        }

        if (!empty($search)) {
            $qb->andWhere('(a.instrucao LIKE :search OR ta.descricao LIKE :search OR r.nome LIKE :search)')
               ->setParameter('search', "%{$search}%");
        }

        return $qb->orderBy('a.dataCadastro', 'DESC')
                  ->setFirstResult(($page - 1) * $limit)
                  ->setMaxResults($limit)
                  ->getQuery()
                  ->getResult();
    }

    public function countByFilters(array $criteria, string $search = ''): int
    {
        $qb = $this->createQueryBuilder('a')
                   ->select('COUNT(a.id)')
                   ->leftJoin('a.tipoAvaliacao', 'ta')
                   ->leftJoin('a.statusAvaliacao', 'sa')
                   ->leftJoin('a.responsavel', 'r');

        foreach ($criteria as $field => $value) {
            $qb->andWhere("a.{$field} = :{$field}")
               ->setParameter($field, $value);
        }

        if (!empty($search)) {
            $qb->andWhere('(a.instrucao LIKE :search OR ta.descricao LIKE :search OR r.nome LIKE :search)')
               ->setParameter('search', "%{$search}%");
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function findByResponsavel(int $responsavelId): array
    {
        return $this->findBy(['responsavel' => $responsavelId], ['dataCadastro' => 'DESC']);
    }

    public function findAtivasParaUsuario(int $usuarioId): array
    {
        return $this->createQueryBuilder('a')
                    ->leftJoin('a.participantes', 'p')
                    ->where('p.usuario = :usuarioId')
                    ->andWhere('p.disponivel = true')
                    ->andWhere('p.avaliado = false')
                    ->setParameter('usuarioId', $usuarioId)
                    ->orderBy('a.dataCadastro', 'DESC')
                    ->getQuery()
                    ->getResult();
    }
}

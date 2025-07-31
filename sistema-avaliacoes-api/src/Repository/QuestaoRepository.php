<?php

namespace App\Repository;

use App\Entity\Questao;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Questao>
 */
class QuestaoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Questao::class);
    }

    public function findByFilters(array $criteria, string $search = '', int $page = 1, int $limit = 10): array
    {
        $qb = $this->createQueryBuilder('q')
                   ->leftJoin('q.disciplina', 'd')
                   ->leftJoin('q.nivelDificuldade', 'nd')
                   ->leftJoin('q.tipoAlternativa', 'ta')
                   ->leftJoin('q.statusQuestao', 'sq');

        foreach ($criteria as $field => $value) {
            $qb->andWhere("q.{$field} = :{$field}")
               ->setParameter($field, $value);
        }

        if (!empty($search)) {
            $qb->andWhere('(q.pergunta LIKE :search OR d.descricao LIKE :search)')
               ->setParameter('search', "%{$search}%");
        }

        return $qb->orderBy('q.dataCadastro', 'DESC')
                  ->setFirstResult(($page - 1) * $limit)
                  ->setMaxResults($limit)
                  ->getQuery()
                  ->getResult();
    }

    public function countByFilters(array $criteria, string $search = ''): int
    {
        $qb = $this->createQueryBuilder('q')
                   ->select('COUNT(q.id)')
                   ->leftJoin('q.disciplina', 'd')
                   ->leftJoin('q.nivelDificuldade', 'nd')
                   ->leftJoin('q.tipoAlternativa', 'ta')
                   ->leftJoin('q.statusQuestao', 'sq');

        foreach ($criteria as $field => $value) {
            $qb->andWhere("q.{$field} = :{$field}")
               ->setParameter($field, $value);
        }

        if (!empty($search)) {
            $qb->andWhere('(q.pergunta LIKE :search OR d.descricao LIKE :search)')
               ->setParameter('search', "%{$search}%");
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function findByDisciplina(int $disciplinaId): array
    {
        return $this->findBy(['disciplina' => $disciplinaId], ['dataCadastro' => 'DESC']);
    }

    public function findDisponiveis(): array
    {
        return $this->createQueryBuilder('q')
                    ->leftJoin('q.statusQuestao', 'sq')
                    ->where('sq.id = 1') // Assumindo que 1 = Ativo
                    ->orderBy('q.pergunta', 'ASC')
                    ->getQuery()
                    ->getResult();
    }
}

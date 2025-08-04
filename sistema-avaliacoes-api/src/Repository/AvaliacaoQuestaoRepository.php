<?php

namespace App\Repository;

use App\Entity\AvaliacaoQuestao;
use App\Entity\Avaliacao;
use App\Entity\Questao;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AvaliacaoQuestao>
 */
class AvaliacaoQuestaoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AvaliacaoQuestao::class);
    }

    /**
     * Buscar questões de uma avaliação ordenadas
     */
    public function findByAvaliacaoOrdered(Avaliacao $avaliacao): array
    {
        return $this->createQueryBuilder('aq')
            ->andWhere('aq.avaliacao = :avaliacao')
            ->setParameter('avaliacao', $avaliacao)
            ->orderBy('aq.ordem', 'ASC')
            ->addOrderBy('aq.dataCadastro', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Buscar questões disponíveis (não vinculadas a uma avaliação específica)
     */
    public function findQuestoesDisponiveis(Avaliacao $avaliacao): array
    {
        $qb = $this->_em->createQueryBuilder();
        
        return $qb->select('q')
            ->from(Questao::class, 'q')
            ->where('q.id NOT IN (
                SELECT IDENTITY(aq.questao) 
                FROM App\Entity\AvaliacaoQuestao aq 
                WHERE aq.avaliacao = :avaliacao
            )')
            ->setParameter('avaliacao', $avaliacao)
            ->orderBy('q.disciplina', 'ASC')
            ->addOrderBy('q.pergunta', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Verificar se uma questão já está vinculada a uma avaliação
     */
    public function isQuestaoVinculada(Avaliacao $avaliacao, Questao $questao): bool
    {
        $result = $this->createQueryBuilder('aq')
            ->select('COUNT(aq.id)')
            ->andWhere('aq.avaliacao = :avaliacao')
            ->andWhere('aq.questao = :questao')
            ->setParameter('avaliacao', $avaliacao)
            ->setParameter('questao', $questao)
            ->getQuery()
            ->getSingleScalarResult();

        return $result > 0;
    }

    /**
     * Obter próxima ordem disponível para uma avaliação
     */
    public function getProximaOrdem(Avaliacao $avaliacao): int
    {
        $result = $this->createQueryBuilder('aq')
            ->select('MAX(aq.ordem)')
            ->andWhere('aq.avaliacao = :avaliacao')
            ->setParameter('avaliacao', $avaliacao)
            ->getQuery()
            ->getSingleScalarResult();

        return ($result ?? 0) + 1;
    }

    /**
     * Atualizar ordens das questões
     */
    public function atualizarOrdens(Avaliacao $avaliacao, array $ordens): void
    {
        foreach ($ordens as $questaoId => $novaOrdem) {
            $this->createQueryBuilder('aq')
                ->update()
                ->set('aq.ordem', ':ordem')
                ->andWhere('aq.avaliacao = :avaliacao')
                ->andWhere('aq.questao = :questao')
                ->setParameter('ordem', $novaOrdem)
                ->setParameter('avaliacao', $avaliacao)
                ->setParameter('questao', $questaoId)
                ->getQuery()
                ->execute();
        }
    }

    /**
     * Remover questão de uma avaliação
     */
    public function removerQuestao(Avaliacao $avaliacao, Questao $questao): bool
    {
        $result = $this->createQueryBuilder('aq')
            ->delete()
            ->andWhere('aq.avaliacao = :avaliacao')
            ->andWhere('aq.questao = :questao')
            ->setParameter('avaliacao', $avaliacao)
            ->setParameter('questao', $questao)
            ->getQuery()
            ->execute();

        return $result > 0;
    }
}

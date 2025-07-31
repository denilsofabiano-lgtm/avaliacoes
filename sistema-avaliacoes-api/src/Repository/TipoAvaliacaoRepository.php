<?php

namespace App\Repository;

use App\Entity\TipoAvaliacao;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class TipoAvaliacaoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TipoAvaliacao::class);
    }
}

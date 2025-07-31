<?php

namespace App\Repository;

use App\Entity\StatusAplicacao;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class StatusAplicacaoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, StatusAplicacao::class);
    }
}

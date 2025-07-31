<?php

namespace App\Repository;

use App\Entity\StatusAvaliacao;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class StatusAvaliacaoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, StatusAvaliacao::class);
    }
}

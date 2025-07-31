<?php

namespace App\Repository;

use App\Entity\StatusQuestao;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class StatusQuestaoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, StatusQuestao::class);
    }
}

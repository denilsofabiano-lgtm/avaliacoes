<?php

namespace App\Repository;

use App\Entity\NivelDificuldade;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class NivelDificuldadeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, NivelDificuldade::class);
    }
}

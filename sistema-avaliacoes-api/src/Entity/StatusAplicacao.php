<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'status_aplicacao')]
class StatusAplicacao
{
    public const PENDENTE = 1;
    public const INICIADO = 2;
    public const CONCLUIDO = 3;
    public const CANCELADO = 4;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['status_aplicacao:read', 'participante:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['status_aplicacao:read', 'status_aplicacao:write', 'participante:read'])]
    private ?string $descricao = null;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    #[Groups(['status_aplicacao:read', 'status_aplicacao:write'])]
    private bool $status = true;

    #[ORM\OneToMany(mappedBy: 'statusAplicacao', targetEntity: ParticipanteAvaliacao::class)]
    private Collection $participantes;

    public function __construct()
    {
        $this->participantes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDescricao(): ?string
    {
        return $this->descricao;
    }

    public function setDescricao(string $descricao): static
    {
        $this->descricao = $descricao;
        return $this;
    }

    public function getStatus(): bool
    {
        return $this->status;
    }

    public function setStatus(bool $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getParticipantes(): Collection
    {
        return $this->participantes;
    }
}

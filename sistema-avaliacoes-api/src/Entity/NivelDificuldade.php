<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'niveis_dificuldade')]
class NivelDificuldade
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['nivel_dificuldade:read', 'questao:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['nivel_dificuldade:read', 'nivel_dificuldade:write', 'questao:read'])]
    private ?string $descricao = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    #[Groups(['nivel_dificuldade:read', 'nivel_dificuldade:write'])]
    private ?int $ordem = null;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    #[Groups(['nivel_dificuldade:read', 'nivel_dificuldade:write'])]
    private bool $status = true;

    #[ORM\OneToMany(mappedBy: 'nivelDificuldade', targetEntity: Questao::class)]
    private Collection $questoes;

    public function __construct()
    {
        $this->questoes = new ArrayCollection();
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

    public function getOrdem(): ?int
    {
        return $this->ordem;
    }

    public function setOrdem(?int $ordem): static
    {
        $this->ordem = $ordem;
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

    public function getQuestoes(): Collection
    {
        return $this->questoes;
    }
}

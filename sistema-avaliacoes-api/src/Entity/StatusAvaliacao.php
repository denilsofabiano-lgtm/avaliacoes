<?php

namespace App\Entity;

use App\Repository\StatusAvaliacaoRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: StatusAvaliacaoRepository::class)]
#[ORM\Table(name: 'status_avaliacao')]
class StatusAvaliacao
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['status_avaliacao:read', 'avaliacao:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['status_avaliacao:read', 'status_avaliacao:write', 'avaliacao:read'])]
    private ?string $descricao = null;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    #[Groups(['status_avaliacao:read', 'status_avaliacao:write'])]
    private bool $status = true;

    #[ORM\OneToMany(mappedBy: 'statusAvaliacao', targetEntity: Avaliacao::class)]
    private Collection $avaliacoes;

    public function __construct()
    {
        $this->avaliacoes = new ArrayCollection();
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

    /**
     * @return Collection<int, Avaliacao>
     */
    public function getAvaliacoes(): Collection
    {
        return $this->avaliacoes;
    }

    public function addAvaliacao(Avaliacao $avaliacao): static
    {
        if (!$this->avaliacoes->contains($avaliacao)) {
            $this->avaliacoes->add($avaliacao);
            $avaliacao->setStatusAvaliacao($this);
        }

        return $this;
    }

    public function removeAvaliacao(Avaliacao $avaliacao): static
    {
        if ($this->avaliacoes->removeElement($avaliacao)) {
            if ($avaliacao->getStatusAvaliacao() === $this) {
                $avaliacao->setStatusAvaliacao(null);
            }
        }

        return $this;
    }
}

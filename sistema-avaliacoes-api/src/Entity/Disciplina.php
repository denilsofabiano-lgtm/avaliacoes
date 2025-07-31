<?php

namespace App\Entity;

use App\Repository\DisciplinaRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: DisciplinaRepository::class)]
#[ORM\Table(name: 'disciplinas')]
class Disciplina
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['disciplina:read', 'questao:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['disciplina:read', 'disciplina:write', 'questao:read'])]
    private ?string $descricao = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['disciplina:read', 'disciplina:write'])]
    private ?string $idDisciplinaExterno = null;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    #[Groups(['disciplina:read', 'disciplina:write'])]
    private bool $status = true;

    #[ORM\OneToMany(mappedBy: 'disciplina', targetEntity: Questao::class)]
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

    public function getIdDisciplinaExterno(): ?string
    {
        return $this->idDisciplinaExterno;
    }

    public function setIdDisciplinaExterno(?string $idDisciplinaExterno): static
    {
        $this->idDisciplinaExterno = $idDisciplinaExterno;
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
     * @return Collection<int, Questao>
     */
    public function getQuestoes(): Collection
    {
        return $this->questoes;
    }

    public function addQuestao(Questao $questao): static
    {
        if (!$this->questoes->contains($questao)) {
            $this->questoes->add($questao);
            $questao->setDisciplina($this);
        }

        return $this;
    }

    public function removeQuestao(Questao $questao): static
    {
        if ($this->questoes->removeElement($questao)) {
            if ($questao->getDisciplina() === $this) {
                $questao->setDisciplina(null);
            }
        }

        return $this;
    }
}

<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'avaliacao_questoes')]
#[ORM\HasLifecycleCallbacks]
class AvaliacaoQuestao
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['avaliacao_questao:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['avaliacao_questao:read'])]
    private ?\DateTimeInterface $dataCadastro = null;

    #[ORM\ManyToOne(targetEntity: Avaliacao::class, inversedBy: 'avaliacaoQuestoes')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['avaliacao_questao:read'])]
    private ?Avaliacao $avaliacao = null;

    #[ORM\ManyToOne(targetEntity: Questao::class, inversedBy: 'avaliacaoQuestoes')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['avaliacao_questao:read', 'avaliacao:read'])]
    private ?Questao $questao = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    #[Groups(['avaliacao_questao:read', 'avaliacao_questao:write'])]
    private ?int $ordem = null;

    #[ORM\PrePersist]
    public function setDataCadastroValue(): void
    {
        if ($this->dataCadastro === null) {
            $this->dataCadastro = new \DateTime();
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDataCadastro(): ?\DateTimeInterface
    {
        return $this->dataCadastro;
    }

    public function setDataCadastro(\DateTimeInterface $dataCadastro): static
    {
        $this->dataCadastro = $dataCadastro;
        return $this;
    }

    public function getAvaliacao(): ?Avaliacao
    {
        return $this->avaliacao;
    }

    public function setAvaliacao(?Avaliacao $avaliacao): static
    {
        $this->avaliacao = $avaliacao;
        return $this;
    }

    public function getQuestao(): ?Questao
    {
        return $this->questao;
    }

    public function setQuestao(?Questao $questao): static
    {
        $this->questao = $questao;
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
}

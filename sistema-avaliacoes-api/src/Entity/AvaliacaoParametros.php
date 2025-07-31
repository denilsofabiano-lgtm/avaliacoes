<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'avaliacao_parametros')]
class AvaliacaoParametros
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['parametro:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Avaliacao::class, inversedBy: 'parametros')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Avaliacao $avaliacao = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    #[Groups(['parametro:read', 'parametro:write'])]
    private ?\DateTimeInterface $dataAplicacao = null;

    #[ORM\ManyToOne(targetEntity: Usuario::class)]
    #[Groups(['parametro:read', 'parametro:write'])]
    private ?Usuario $usuario = null;

    #[ORM\ManyToOne(targetEntity: StatusAplicacao::class)]
    #[Groups(['parametro:read', 'parametro:write'])]
    private ?StatusAplicacao $statusAplicacao = null;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    #[Groups(['parametro:read', 'parametro:write'])]
    private bool $status = true;

    #[ORM\Column(type: 'integer', nullable: true)]
    #[Groups(['parametro:read', 'parametro:write'])]
    private ?int $tempoLimite = null; // Em minutos

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['parametro:read', 'parametro:write'])]
    private bool $embaralharQuestoes = false;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['parametro:read', 'parametro:write'])]
    private bool $embaralharAlternativas = false;

    public function getId(): ?int
    {
        return $this->id;
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

    public function getDataAplicacao(): ?\DateTimeInterface
    {
        return $this->dataAplicacao;
    }

    public function setDataAplicacao(?\DateTimeInterface $dataAplicacao): static
    {
        $this->dataAplicacao = $dataAplicacao;
        return $this;
    }

    public function getUsuario(): ?Usuario
    {
        return $this->usuario;
    }

    public function setUsuario(?Usuario $usuario): static
    {
        $this->usuario = $usuario;
        return $this;
    }

    public function getStatusAplicacao(): ?StatusAplicacao
    {
        return $this->statusAplicacao;
    }

    public function setStatusAplicacao(?StatusAplicacao $statusAplicacao): static
    {
        $this->statusAplicacao = $statusAplicacao;
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

    public function getTempoLimite(): ?int
    {
        return $this->tempoLimite;
    }

    public function setTempoLimite(?int $tempoLimite): static
    {
        $this->tempoLimite = $tempoLimite;
        return $this;
    }

    public function isEmbaralharQuestoes(): bool
    {
        return $this->embaralharQuestoes;
    }

    public function setEmbaralharQuestoes(bool $embaralharQuestoes): static
    {
        $this->embaralharQuestoes = $embaralharQuestoes;
        return $this;
    }

    public function isEmbaralharAlternativas(): bool
    {
        return $this->embaralharAlternativas;
    }

    public function setEmbaralharAlternativas(bool $embaralharAlternativas): static
    {
        $this->embaralharAlternativas = $embaralharAlternativas;
        return $this;
    }
}

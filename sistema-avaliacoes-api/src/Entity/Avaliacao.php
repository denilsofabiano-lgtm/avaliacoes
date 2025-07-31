<?php

namespace App\Entity;

use App\Repository\AvaliacaoRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: AvaliacaoRepository::class)]
#[ORM\Table(name: 'avaliacoes')]
#[ORM\HasLifecycleCallbacks]
class Avaliacao
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['avaliacao:read', 'avaliacao:list'])]
    private ?int $id = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['avaliacao:read', 'avaliacao:list'])]
    private ?\DateTimeInterface $dataCadastro = null;

    #[ORM\ManyToOne(targetEntity: TipoAvaliacao::class, inversedBy: 'avaliacoes')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['avaliacao:read', 'avaliacao:write', 'avaliacao:list'])]
    private ?TipoAvaliacao $tipoAvaliacao = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['avaliacao:read', 'avaliacao:write', 'avaliacao:list'])]
    private ?string $instrucao = null;

    #[ORM\ManyToOne(targetEntity: Usuario::class, inversedBy: 'avaliacoes')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['avaliacao:read', 'avaliacao:write', 'avaliacao:list'])]
    private ?Usuario $responsavel = null;

    #[ORM\ManyToOne(targetEntity: StatusAvaliacao::class, inversedBy: 'avaliacoes')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['avaliacao:read', 'avaliacao:write', 'avaliacao:list'])]
    private ?StatusAvaliacao $statusAvaliacao = null;

    #[ORM\OneToMany(mappedBy: 'avaliacao', targetEntity: AvaliacaoQuestao::class, cascade: ['persist', 'remove'])]
    #[Groups(['avaliacao:read'])]
    private Collection $avaliacaoQuestoes;

    #[ORM\OneToMany(mappedBy: 'avaliacao', targetEntity: ParticipanteAvaliacao::class, cascade: ['persist', 'remove'])]
    #[Groups(['avaliacao:read'])]
    private Collection $participantes;

    #[ORM\OneToMany(mappedBy: 'avaliacao', targetEntity: AvaliacaoParametros::class, cascade: ['persist', 'remove'])]
    private Collection $parametros;

    public function __construct()
    {
        $this->avaliacaoQuestoes = new ArrayCollection();
        $this->participantes = new ArrayCollection();
        $this->parametros = new ArrayCollection();
    }

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

    public function getTipoAvaliacao(): ?TipoAvaliacao
    {
        return $this->tipoAvaliacao;
    }

    public function setTipoAvaliacao(?TipoAvaliacao $tipoAvaliacao): static
    {
        $this->tipoAvaliacao = $tipoAvaliacao;
        return $this;
    }

    public function getInstrucao(): ?string
    {
        return $this->instrucao;
    }

    public function setInstrucao(?string $instrucao): static
    {
        $this->instrucao = $instrucao;
        return $this;
    }

    public function getResponsavel(): ?Usuario
    {
        return $this->responsavel;
    }

    public function setResponsavel(?Usuario $responsavel): static
    {
        $this->responsavel = $responsavel;
        return $this;
    }

    public function getStatusAvaliacao(): ?StatusAvaliacao
    {
        return $this->statusAvaliacao;
    }

    public function setStatusAvaliacao(?StatusAvaliacao $statusAvaliacao): static
    {
        $this->statusAvaliacao = $statusAvaliacao;
        return $this;
    }

    /**
     * @return Collection<int, AvaliacaoQuestao>
     */
    public function getAvaliacaoQuestoes(): Collection
    {
        return $this->avaliacaoQuestoes;
    }

    public function addAvaliacaoQuestao(AvaliacaoQuestao $avaliacaoQuestao): static
    {
        if (!$this->avaliacaoQuestoes->contains($avaliacaoQuestao)) {
            $this->avaliacaoQuestoes->add($avaliacaoQuestao);
            $avaliacaoQuestao->setAvaliacao($this);
        }

        return $this;
    }

    public function removeAvaliacaoQuestao(AvaliacaoQuestao $avaliacaoQuestao): static
    {
        if ($this->avaliacaoQuestoes->removeElement($avaliacaoQuestao)) {
            if ($avaliacaoQuestao->getAvaliacao() === $this) {
                $avaliacaoQuestao->setAvaliacao(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ParticipanteAvaliacao>
     */
    public function getParticipantes(): Collection
    {
        return $this->participantes;
    }

    public function addParticipante(ParticipanteAvaliacao $participante): static
    {
        if (!$this->participantes->contains($participante)) {
            $this->participantes->add($participante);
            $participante->setAvaliacao($this);
        }

        return $this;
    }

    public function removeParticipante(ParticipanteAvaliacao $participante): static
    {
        if ($this->participantes->removeElement($participante)) {
            if ($participante->getAvaliacao() === $this) {
                $participante->setAvaliacao(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, AvaliacaoParametros>
     */
    public function getParametros(): Collection
    {
        return $this->parametros;
    }

    public function addParametro(AvaliacaoParametros $parametro): static
    {
        if (!$this->parametros->contains($parametro)) {
            $this->parametros->add($parametro);
            $parametro->setAvaliacao($this);
        }

        return $this;
    }

    public function removeParametro(AvaliacaoParametros $parametro): static
    {
        if ($this->parametros->removeElement($parametro)) {
            if ($parametro->getAvaliacao() === $this) {
                $parametro->setAvaliacao(null);
            }
        }

        return $this;
    }

    /**
     * Retorna as questões associadas à avaliação
     */
    #[Groups(['avaliacao:read'])]
    public function getQuestoes(): array
    {
        return $this->avaliacaoQuestoes->map(function(AvaliacaoQuestao $aq) {
            return $aq->getQuestao();
        })->toArray();
    }

    /**
     * Retorna o número total de questões
     */
    #[Groups(['avaliacao:read', 'avaliacao:list'])]
    public function getTotalQuestoes(): int
    {
        return $this->avaliacaoQuestoes->count();
    }
}

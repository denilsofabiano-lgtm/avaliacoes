<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'participante_avaliacao')]
#[ORM\HasLifecycleCallbacks]
class ParticipanteAvaliacao
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['participante:read', 'participante:list'])]
    private ?int $id = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['participante:read'])]
    private ?\DateTimeInterface $dataCadastro = null;

    #[ORM\ManyToOne(targetEntity: Avaliacao::class, inversedBy: 'participantes')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['participante:read', 'participante:write'])]
    private ?Avaliacao $avaliacao = null;

    #[ORM\ManyToOne(targetEntity: Usuario::class, inversedBy: 'participacaoAvaliacoes')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['participante:read', 'participante:write', 'participante:list'])]
    private ?Usuario $usuario = null;

    #[ORM\Column(length: 10, nullable: true)]
    #[Groups(['participante:read', 'participante:write'])]
    private ?string $ano = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['participante:read', 'participante:write', 'participante:list'])]
    private ?string $escola = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['participante:read', 'participante:write'])]
    private ?string $turma = null;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    #[Groups(['participante:read', 'participante:write', 'participante:list'])]
    private bool $disponivel = true;

    #[ORM\Column(type: 'datetime', nullable: true)]
    #[Groups(['participante:read', 'participante:write'])]
    private ?\DateTimeInterface $dataInicioAvaliacao = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    #[Groups(['participante:read', 'participante:write'])]
    private ?\DateTimeInterface $dataInicio = null;

    #[ORM\Column(type: 'time', nullable: true)]
    #[Groups(['participante:read', 'participante:write'])]
    private ?\DateTimeInterface $horaInicio = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    #[Groups(['participante:read', 'participante:write'])]
    private ?\DateTimeInterface $dataFim = null;

    #[ORM\Column(type: 'time', nullable: true)]
    #[Groups(['participante:read', 'participante:write'])]
    private ?\DateTimeInterface $horaFim = null;

    #[ORM\ManyToOne(targetEntity: StatusAplicacao::class, inversedBy: 'participantes')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['participante:read', 'participante:write', 'participante:list'])]
    private ?StatusAplicacao $statusAplicacao = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['participante:read', 'participante:write', 'participante:list'])]
    private bool $avaliado = false;

    #[ORM\OneToMany(mappedBy: 'participante', targetEntity: AvaliacaoResposta::class, cascade: ['persist', 'remove'])]
    private Collection $respostas;

    public function __construct()
    {
        $this->respostas = new ArrayCollection();
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

    public function getAvaliacao(): ?Avaliacao
    {
        return $this->avaliacao;
    }

    public function setAvaliacao(?Avaliacao $avaliacao): static
    {
        $this->avaliacao = $avaliacao;
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

    public function getAno(): ?string
    {
        return $this->ano;
    }

    public function setAno(?string $ano): static
    {
        $this->ano = $ano;
        return $this;
    }

    public function getEscola(): ?string
    {
        return $this->escola;
    }

    public function setEscola(?string $escola): static
    {
        $this->escola = $escola;
        return $this;
    }

    public function getTurma(): ?string
    {
        return $this->turma;
    }

    public function setTurma(?string $turma): static
    {
        $this->turma = $turma;
        return $this;
    }

    public function isDisponivel(): bool
    {
        return $this->disponivel;
    }

    public function setDisponivel(bool $disponivel): static
    {
        $this->disponivel = $disponivel;
        return $this;
    }

    public function getDataInicioAvaliacao(): ?\DateTimeInterface
    {
        return $this->dataInicioAvaliacao;
    }

    public function setDataInicioAvaliacao(?\DateTimeInterface $dataInicioAvaliacao): static
    {
        $this->dataInicioAvaliacao = $dataInicioAvaliacao;
        return $this;
    }

    public function getDataInicio(): ?\DateTimeInterface
    {
        return $this->dataInicio;
    }

    public function setDataInicio(?\DateTimeInterface $dataInicio): static
    {
        $this->dataInicio = $dataInicio;
        return $this;
    }

    public function getHoraInicio(): ?\DateTimeInterface
    {
        return $this->horaInicio;
    }

    public function setHoraInicio(?\DateTimeInterface $horaInicio): static
    {
        $this->horaInicio = $horaInicio;
        return $this;
    }

    public function getDataFim(): ?\DateTimeInterface
    {
        return $this->dataFim;
    }

    public function setDataFim(?\DateTimeInterface $dataFim): static
    {
        $this->dataFim = $dataFim;
        return $this;
    }

    public function getHoraFim(): ?\DateTimeInterface
    {
        return $this->horaFim;
    }

    public function setHoraFim(?\DateTimeInterface $horaFim): static
    {
        $this->horaFim = $horaFim;
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

    public function isAvaliado(): bool
    {
        return $this->avaliado;
    }

    public function setAvaliado(bool $avaliado): static
    {
        $this->avaliado = $avaliado;
        return $this;
    }

    public function getRespostas(): Collection
    {
        return $this->respostas;
    }

    /**
     * Calcula o progresso da avaliação
     */
    #[Groups(['participante:read', 'participante:list'])]
    public function getProgresso(): array
    {
        $totalQuestoes = $this->avaliacao ? $this->avaliacao->getTotalQuestoes() : 0;
        $respondidas = $this->respostas->count();
        
        return [
            'respondidas' => $respondidas,
            'total' => $totalQuestoes,
            'percentual' => $totalQuestoes > 0 ? round(($respondidas / $totalQuestoes) * 100, 2) : 0
        ];
    }

    /**
     * Calcula o tempo decorrido
     */
    #[Groups(['participante:read', 'participante:list'])]
    public function getTempoDecorrido(): ?string
    {
        if (!$this->dataInicio) {
            return null;
        }

        $fim = $this->dataFim ?? new \DateTime();
        $interval = $this->dataInicio->diff($fim);
        
        return $interval->format('%H:%I:%S');
    }
}

<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'avaliacao_respostas')]
#[ORM\HasLifecycleCallbacks]
class AvaliacaoResposta
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['resposta:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['resposta:read'])]
    private ?\DateTimeInterface $dataCadastro = null;

    #[ORM\ManyToOne(targetEntity: Usuario::class, inversedBy: 'respostas')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['resposta:read'])]
    private ?Usuario $usuario = null;

    #[ORM\ManyToOne(targetEntity: ParticipanteAvaliacao::class, inversedBy: 'respostas')]
    #[ORM\JoinColumn(nullable: false)]
    private ?ParticipanteAvaliacao $participante = null;

    #[ORM\ManyToOne(targetEntity: Questao::class, inversedBy: 'respostas')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['resposta:read', 'resposta:write'])]
    private ?Questao $questao = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['resposta:read', 'resposta:write'])]
    private ?string $resposta = null;

    #[ORM\ManyToOne(targetEntity: QuestaoAlternativa::class)]
    #[Groups(['resposta:read', 'resposta:write'])]
    private ?QuestaoAlternativa $questaoAlternativa = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    #[Groups(['resposta:read'])]
    private ?bool $correta = null;

    #[ORM\Column(length: 1, nullable: true)]
    #[Groups(['resposta:read'])]
    private ?string $corrigidoPor = null; // 'I' = IA, 'M' = Manual

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['resposta:read', 'resposta:write'])]
    private ?string $observacoes = null;

    #[ORM\Column(type: 'decimal', precision: 5, scale: 2, nullable: true)]
    #[Groups(['resposta:read'])]
    private ?string $pontuacao = null;

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

    public function getUsuario(): ?Usuario
    {
        return $this->usuario;
    }

    public function setUsuario(?Usuario $usuario): static
    {
        $this->usuario = $usuario;
        return $this;
    }

    public function getParticipante(): ?ParticipanteAvaliacao
    {
        return $this->participante;
    }

    public function setParticipante(?ParticipanteAvaliacao $participante): static
    {
        $this->participante = $participante;
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

    public function getResposta(): ?string
    {
        return $this->resposta;
    }

    public function setResposta(?string $resposta): static
    {
        $this->resposta = $resposta;
        return $this;
    }

    public function getQuestaoAlternativa(): ?QuestaoAlternativa
    {
        return $this->questaoAlternativa;
    }

    public function setQuestaoAlternativa(?QuestaoAlternativa $questaoAlternativa): static
    {
        $this->questaoAlternativa = $questaoAlternativa;
        return $this;
    }

    public function isCorreta(): ?bool
    {
        return $this->correta;
    }

    public function setCorreta(?bool $correta): static
    {
        $this->correta = $correta;
        return $this;
    }

    public function getCorrigidoPor(): ?string
    {
        return $this->corrigidoPor;
    }

    public function setCorrigidoPor(?string $corrigidoPor): static
    {
        $this->corrigidoPor = $corrigidoPor;
        return $this;
    }

    public function getObservacoes(): ?string
    {
        return $this->observacoes;
    }

    public function setObservacoes(?string $observacoes): static
    {
        $this->observacoes = $observacoes;
        return $this;
    }

    public function getPontuacao(): ?string
    {
        return $this->pontuacao;
    }

    public function setPontuacao(?string $pontuacao): static
    {
        $this->pontuacao = $pontuacao;
        return $this;
    }
}

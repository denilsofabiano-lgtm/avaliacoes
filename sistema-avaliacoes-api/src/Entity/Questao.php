<?php

namespace App\Entity;

use App\Repository\QuestaoRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: QuestaoRepository::class)]
#[ORM\Table(name: 'questoes')]
#[ORM\HasLifecycleCallbacks]
class Questao
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['questao:read', 'questao:list', 'avaliacao:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['questao:read'])]
    private ?\DateTimeInterface $dataCadastro = null;

    #[ORM\ManyToOne(targetEntity: QuestaoContexto::class, cascade: ['persist'])]
    #[Groups(['questao:read', 'questao:write'])]
    private ?QuestaoContexto $questaoContexto = null;

    #[ORM\Column(type: 'text')]
    #[Assert\NotBlank]
    #[Groups(['questao:read', 'questao:write', 'questao:list', 'avaliacao:read'])]
    private ?string $pergunta = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['questao:read', 'questao:write'])]
    private bool $geradorIa = false;

    #[ORM\ManyToOne(targetEntity: StatusQuestao::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['questao:read', 'questao:write'])]
    private ?StatusQuestao $statusQuestao = null;

    #[ORM\ManyToOne(targetEntity: Disciplina::class, inversedBy: 'questoes')]
    #[Groups(['questao:read', 'questao:write', 'questao:list'])]
    private ?Disciplina $disciplina = null;

    #[ORM\Column(type: 'decimal', precision: 5, scale: 2, nullable: true)]
    #[Groups(['questao:read', 'questao:write'])]
    private ?string $pontuacao = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['questao:read', 'questao:write'])]
    private ?string $arquivoImagem = null;

    #[ORM\ManyToOne(targetEntity: TipoAlternativa::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['questao:read', 'questao:write'])]
    private ?TipoAlternativa $tipoAlternativa = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['questao:read', 'questao:write'])]
    private ?string $respostaCorreta = null;

    #[ORM\ManyToOne(targetEntity: NivelDificuldade::class)]
    #[Groups(['questao:read', 'questao:write'])]
    private ?NivelDificuldade $nivelDificuldade = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['questao:read', 'questao:write'])]
    private ?string $ciclo = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['questao:read', 'questao:write'])]
    private ?string $fase = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['questao:read', 'questao:write'])]
    private ?string $tema = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['questao:read', 'questao:write'])]
    private ?string $habilidades = null;

    #[ORM\OneToMany(mappedBy: 'questao', targetEntity: QuestaoAlternativa::class, cascade: ['persist', 'remove'])]
    #[Groups(['questao:read', 'questao:write', 'avaliacao:read'])]
    private Collection $alternativas;

    #[ORM\OneToMany(mappedBy: 'questao', targetEntity: AvaliacaoQuestao::class)]
    private Collection $avaliacaoQuestoes;

    #[ORM\OneToMany(mappedBy: 'questao', targetEntity: AvaliacaoResposta::class)]
    private Collection $respostas;

    public function __construct()
    {
        $this->alternativas = new ArrayCollection();
        $this->avaliacaoQuestoes = new ArrayCollection();
        $this->respostas = new ArrayCollection();
    }

    #[ORM\PrePersist]
    public function setDataCadastroValue(): void
    {
        if ($this->dataCadastro === null) {
            $this->dataCadastro = new \DateTime();
        }
    }

    // Getters e Setters
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

    public function getQuestaoContexto(): ?QuestaoContexto
    {
        return $this->questaoContexto;
    }

    public function setQuestaoContexto(?QuestaoContexto $questaoContexto): static
    {
        $this->questaoContexto = $questaoContexto;
        return $this;
    }

    public function getPergunta(): ?string
    {
        return $this->pergunta;
    }

    public function setPergunta(string $pergunta): static
    {
        $this->pergunta = $pergunta;
        return $this;
    }

    public function isGeradorIa(): bool
    {
        return $this->geradorIa;
    }

    public function setGeradorIa(bool $geradorIa): static
    {
        $this->geradorIa = $geradorIa;
        return $this;
    }

    public function getStatusQuestao(): ?StatusQuestao
    {
        return $this->statusQuestao;
    }

    public function setStatusQuestao(?StatusQuestao $statusQuestao): static
    {
        $this->statusQuestao = $statusQuestao;
        return $this;
    }

    public function getDisciplina(): ?Disciplina
    {
        return $this->disciplina;
    }

    public function setDisciplina(?Disciplina $disciplina): static
    {
        $this->disciplina = $disciplina;
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

    public function getArquivoImagem(): ?string
    {
        return $this->arquivoImagem;
    }

    public function setArquivoImagem(?string $arquivoImagem): static
    {
        $this->arquivoImagem = $arquivoImagem;
        return $this;
    }

    public function getTipoAlternativa(): ?TipoAlternativa
    {
        return $this->tipoAlternativa;
    }

    public function setTipoAlternativa(?TipoAlternativa $tipoAlternativa): static
    {
        $this->tipoAlternativa = $tipoAlternativa;
        return $this;
    }

    public function getRespostaCorreta(): ?string
    {
        return $this->respostaCorreta;
    }

    public function setRespostaCorreta(?string $respostaCorreta): static
    {
        $this->respostaCorreta = $respostaCorreta;
        return $this;
    }

    public function getNivelDificuldade(): ?NivelDificuldade
    {
        return $this->nivelDificuldade;
    }

    public function setNivelDificuldade(?NivelDificuldade $nivelDificuldade): static
    {
        $this->nivelDificuldade = $nivelDificuldade;
        return $this;
    }

    public function getCiclo(): ?string
    {
        return $this->ciclo;
    }

    public function setCiclo(?string $ciclo): static
    {
        $this->ciclo = $ciclo;
        return $this;
    }

    public function getFase(): ?string
    {
        return $this->fase;
    }

    public function setFase(?string $fase): static
    {
        $this->fase = $fase;
        return $this;
    }

    public function getTema(): ?string
    {
        return $this->tema;
    }

    public function setTema(?string $tema): static
    {
        $this->tema = $tema;
        return $this;
    }

    public function getHabilidades(): ?string
    {
        return $this->habilidades;
    }

    public function setHabilidades(?string $habilidades): static
    {
        $this->habilidades = $habilidades;
        return $this;
    }

    /**
     * @return Collection<int, QuestaoAlternativa>
     */
    public function getAlternativas(): Collection
    {
        return $this->alternativas;
    }

    public function addAlternativa(QuestaoAlternativa $alternativa): static
    {
        if (!$this->alternativas->contains($alternativa)) {
            $this->alternativas->add($alternativa);
            $alternativa->setQuestao($this);
        }

        return $this;
    }

    public function removeAlternativa(QuestaoAlternativa $alternativa): static
    {
        if ($this->alternativas->removeElement($alternativa)) {
            if ($alternativa->getQuestao() === $this) {
                $alternativa->setQuestao(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, AvaliacaoQuestao>
     */
    public function getAvaliacaoQuestoes(): Collection
    {
        return $this->avaliacaoQuestoes;
    }

    /**
     * @return Collection<int, AvaliacaoResposta>
     */
    public function getRespostas(): Collection
    {
        return $this->respostas;
    }
}

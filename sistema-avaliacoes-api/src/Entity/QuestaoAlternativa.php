<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'questao_alternativas')]
#[ORM\HasLifecycleCallbacks]
class QuestaoAlternativa
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['alternativa:read', 'questao:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['alternativa:read'])]
    private ?\DateTimeInterface $dataCadastro = null;

    #[ORM\ManyToOne(targetEntity: Questao::class, inversedBy: 'alternativas')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Questao $questao = null;

    #[ORM\Column(length: 10)]
    #[Groups(['alternativa:read', 'alternativa:write', 'questao:read'])]
    private ?string $alternativa = null;

    #[ORM\Column(type: 'text')]
    #[Groups(['alternativa:read', 'alternativa:write', 'questao:read'])]
    private ?string $conteudo = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['alternativa:read', 'alternativa:write'])]
    private ?string $arquivoImagem = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['alternativa:read', 'alternativa:write'])]
    private bool $correta = false;

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

    public function getQuestao(): ?Questao
    {
        return $this->questao;
    }

    public function setQuestao(?Questao $questao): static
    {
        $this->questao = $questao;
        return $this;
    }

    public function getAlternativa(): ?string
    {
        return $this->alternativa;
    }

    public function setAlternativa(string $alternativa): static
    {
        $this->alternativa = $alternativa;
        return $this;
    }

    public function getConteudo(): ?string
    {
        return $this->conteudo;
    }

    public function setConteudo(string $conteudo): static
    {
        $this->conteudo = $conteudo;
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

    public function isCorreta(): bool
    {
        return $this->correta;
    }

    public function setCorreta(bool $correta): static
    {
        $this->correta = $correta;
        return $this;
    }
}

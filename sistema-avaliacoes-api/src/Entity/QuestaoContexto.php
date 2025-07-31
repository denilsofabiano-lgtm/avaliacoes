<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'questao_contexto')]
#[ORM\HasLifecycleCallbacks]
class QuestaoContexto
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['questao_contexto:read', 'questao:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['questao_contexto:read'])]
    private ?\DateTimeInterface $dataCadastro = null;

    #[ORM\Column(type: 'text')]
    #[Groups(['questao_contexto:read', 'questao_contexto:write', 'questao:read'])]
    private ?string $contexto = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['questao_contexto:read', 'questao_contexto:write'])]
    private bool $geradorIa = false;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['questao_contexto:read', 'questao_contexto:write'])]
    private ?string $arquivoImagem = null;

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

    public function getContexto(): ?string
    {
        return $this->contexto;
    }

    public function setContexto(string $contexto): static
    {
        $this->contexto = $contexto;
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

    public function getArquivoImagem(): ?string
    {
        return $this->arquivoImagem;
    }

    public function setArquivoImagem(?string $arquivoImagem): static
    {
        $this->arquivoImagem = $arquivoImagem;
        return $this;
    }
}

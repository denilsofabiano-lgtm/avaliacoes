<?php

namespace App\Entity;

use App\Repository\UsuarioRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UsuarioRepository::class)]
#[ORM\Table(name: 'usuarios')]
#[ORM\HasLifecycleCallbacks]
class Usuario implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['usuario:read', 'usuario:list'])]
    private ?int $id = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['usuario:read'])]
    private ?\DateTimeInterface $dataCadastro = null;

    #[ORM\Column(length: 14, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Length(min: 11, max: 14)]
    #[Groups(['usuario:read', 'usuario:write', 'usuario:list'])]
    private ?string $cpf = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 255)]
    #[Groups(['usuario:read', 'usuario:write', 'usuario:list'])]
    private ?string $nome = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Email]
    #[Groups(['usuario:read', 'usuario:write', 'usuario:list'])]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    #[Groups(['usuario:write'])]
    private ?string $senha = null;

    #[ORM\Column(type: 'json')]
    #[Groups(['usuario:read', 'usuario:write'])]
    private array $roles = [];

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    #[Groups(['usuario:read', 'usuario:write', 'usuario:list'])]
    private bool $status = true;

    #[ORM\OneToMany(mappedBy: 'responsavel', targetEntity: Avaliacao::class)]
    private Collection $avaliacoes;

    #[ORM\OneToMany(mappedBy: 'usuario', targetEntity: ParticipanteAvaliacao::class)]
    private Collection $participacaoAvaliacoes;

    #[ORM\OneToMany(mappedBy: 'usuario', targetEntity: AvaliacaoResposta::class)]
    private Collection $respostas;

    public function __construct()
    {
        $this->avaliacoes = new ArrayCollection();
        $this->participacaoAvaliacoes = new ArrayCollection();
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

    public function getCpf(): ?string
    {
        return $this->cpf;
    }

    public function setCpf(string $cpf): static
    {
        $this->cpf = $cpf;
        return $this;
    }

    public function getNome(): ?string
    {
        return $this->nome;
    }

    public function setNome(string $nome): static
    {
        $this->nome = $nome;
        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getSenha(): ?string
    {
        return $this->senha;
    }

    public function setSenha(string $senha): static
    {
        $this->senha = $senha;
        return $this;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        // garantir que todo usuário tenha pelo menos ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
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

    // Implementação UserInterface
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function eraseCredentials(): void
    {
        // Se você armazenar dados temporários e sensíveis do usuário, limpe-os aqui
    }

    // Implementação PasswordAuthenticatedUserInterface
    public function getPassword(): string
    {
        return $this->senha;
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
            $avaliacao->setResponsavel($this);
        }

        return $this;
    }

    public function removeAvaliacao(Avaliacao $avaliacao): static
    {
        if ($this->avaliacoes->removeElement($avaliacao)) {
            if ($avaliacao->getResponsavel() === $this) {
                $avaliacao->setResponsavel(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ParticipanteAvaliacao>
     */
    public function getParticipacaoAvaliacoes(): Collection
    {
        return $this->participacaoAvaliacoes;
    }

    public function addParticipacaoAvaliacao(ParticipanteAvaliacao $participacaoAvaliacao): static
    {
        if (!$this->participacaoAvaliacoes->contains($participacaoAvaliacao)) {
            $this->participacaoAvaliacoes->add($participacaoAvaliacao);
            $participacaoAvaliacao->setUsuario($this);
        }

        return $this;
    }

    public function removeParticipacaoAvaliacao(ParticipanteAvaliacao $participacaoAvaliacao): static
    {
        if ($this->participacaoAvaliacoes->removeElement($participacaoAvaliacao)) {
            if ($participacaoAvaliacao->getUsuario() === $this) {
                $participacaoAvaliacao->setUsuario(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, AvaliacaoResposta>
     */
    public function getRespostas(): Collection
    {
        return $this->respostas;
    }

    public function addResposta(AvaliacaoResposta $resposta): static
    {
        if (!$this->respostas->contains($resposta)) {
            $this->respostas->add($resposta);
            $resposta->setUsuario($this);
        }

        return $this;
    }

    public function removeResposta(AvaliacaoResposta $resposta): static
    {
        if ($this->respostas->removeElement($resposta)) {
            if ($resposta->getUsuario() === $this) {
                $resposta->setUsuario(null);
            }
        }

        return $this;
    }
}

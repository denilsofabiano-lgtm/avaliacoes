import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { Avaliacao, Usuario, ParticipanteAvaliacao, StatusAplicacaoEnum } from '../../../models';
import { AvaliacaoService } from '../../../services/avaliacao.service';
import { UsuarioService } from '../../../services/usuario.service';
import { extractErrorMessage } from '../../../utils/error-utils';

@Component({
  selector: 'app-aplicacao-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatStepperModule
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>assignment</mat-icon>
            Nova Aplicação de Avaliação
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <mat-stepper [linear]="true" #stepper>
            <!-- Passo 1: Selecionar Avaliação -->
            <mat-step [stepControl]="avaliacaoForm" label="Selecionar Avaliação">
              <form [formGroup]="avaliacaoForm">
                <div class="form-row">
                  <mat-form-field>
                    <mat-label>Avaliação</mat-label>
                    <mat-select formControlName="avaliacaoId" required>
                      <mat-option value="">Selecione uma avaliação</mat-option>
                      <mat-option *ngFor="let avaliacao of avaliacoes" [value]="avaliacao.id">
                        {{ avaliacao.tipoAvaliacao?.descricao }} - {{ getInstrucaoPreview(avaliacao.instrucao) }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="avaliacaoForm.get('avaliacaoId')?.hasError('required')">
                      Selecione uma avaliação
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row" *ngIf="avaliacaoSelecionada">
                  <div class="avaliacao-preview">
                    <h3>{{ avaliacaoSelecionada.tipoAvaliacao?.descricao }}</h3>
                    <p><strong>Responsável:</strong> {{ avaliacaoSelecionada.responsavel?.nome }}</p>
                    <p><strong>Instrução:</strong> {{ avaliacaoSelecionada.instrucao }}</p>
                  </div>
                </div>

                <div class="form-actions">
                  <button mat-raised-button matStepperNext color="primary" 
                          [disabled]="avaliacaoForm.invalid">
                    Próximo
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Passo 2: Configurar Aplicação -->
            <mat-step [stepControl]="configuracaoForm" label="Configurar Aplicação">
              <form [formGroup]="configuracaoForm">
                <div class="form-row">
                  <mat-form-field>
                    <mat-label>Escola</mat-label>
                    <input matInput formControlName="escola" required>
                    <mat-error *ngIf="configuracaoForm.get('escola')?.hasError('required')">
                      Informe a escola
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Turma</mat-label>
                    <input matInput formControlName="turma" required>
                    <mat-error *ngIf="configuracaoForm.get('turma')?.hasError('required')">
                      Informe a turma
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field>
                    <mat-label>Ano</mat-label>
                    <mat-select formControlName="ano" required>
                      <mat-option value="2024">2024</mat-option>
                      <mat-option value="2025">2025</mat-option>
                    </mat-select>
                    <mat-error *ngIf="configuracaoForm.get('ano')?.hasError('required')">
                      Selecione o ano
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Data de Início da Avaliação</mat-label>
                    <input matInput [matDatepicker]="picker" formControlName="dataInicioAvaliacao" required>
                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                    <mat-error *ngIf="configuracaoForm.get('dataInicioAvaliacao')?.hasError('required')">
                      Selecione a data de início
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-checkbox formControlName="disponivel">
                    Disponível para aplicação imediatamente
                  </mat-checkbox>
                </div>

                <div class="form-actions">
                  <button mat-button matStepperPrevious>Voltar</button>
                  <button mat-raised-button matStepperNext color="primary" 
                          [disabled]="configuracaoForm.invalid">
                    Próximo
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Passo 3: Selecionar Alunos -->
            <mat-step [stepControl]="alunosForm" label="Selecionar Alunos">
              <form [formGroup]="alunosForm">
                <div class="form-row">
                  <mat-form-field>
                    <mat-label>Buscar alunos</mat-label>
                    <input matInput 
                           placeholder="Digite o nome do aluno..."
                           [matAutocomplete]="auto"
                           (input)="filterAlunos($event)">
                    <mat-autocomplete #auto="matAutocomplete" 
                                      (optionSelected)="adicionarAluno($event.option.value)">
                      <mat-option *ngFor="let aluno of alunosFiltrados | async" [value]="aluno">
                        {{ aluno.nome }} - {{ aluno.email }}
                      </mat-option>
                    </mat-autocomplete>
                  </mat-form-field>
                </div>

                <div class="alunos-selecionados" *ngIf="alunosSelecionados.length > 0">
                  <h3>Alunos Selecionados ({{ alunosSelecionados.length }})</h3>
                  <mat-chip-set>
                    <mat-chip *ngFor="let aluno of alunosSelecionados" (removed)="removerAluno(aluno)">
                      {{ aluno.nome }}
                      <mat-icon matChipRemove>cancel</mat-icon>
                    </mat-chip>
                  </mat-chip-set>
                </div>

                <div class="form-actions">
                  <button mat-button matStepperPrevious>Voltar</button>
                  <button mat-raised-button color="primary" 
                          [disabled]="alunosSelecionados.length === 0"
                          (click)="criarAplicacao()">
                    Criar Aplicação
                  </button>
                </div>
              </form>
            </mat-step>
          </mat-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .form-row mat-form-field {
      flex: 1;
      min-width: 200px;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .avaliacao-preview {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      width: 100%;
    }

    .avaliacao-preview h3 {
      margin: 0 0 8px 0;
      color: #1976d2;
    }

    .avaliacao-preview p {
      margin: 4px 0;
      font-size: 0.9em;
    }

    .alunos-selecionados {
      margin-top: 20px;
    }

    .alunos-selecionados h3 {
      margin-bottom: 12px;
      color: #333;
    }

    mat-chip-set {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .form-container {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
      }

      .form-row mat-form-field {
        width: 100%;
        min-width: unset;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class AplicacaoFormComponent implements OnInit {
  avaliacaoForm: FormGroup;
  configuracaoForm: FormGroup;
  alunosForm: FormGroup;

  avaliacoes: Avaliacao[] = [];
  usuarios: Usuario[] = [];
  alunosSelecionados: Usuario[] = [];
  alunosFiltrados: Observable<Usuario[]> = of([]);

  avaliacaoSelecionada?: Avaliacao;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private avaliacaoService: AvaliacaoService,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar
  ) {
    this.avaliacaoForm = this.fb.group({
      avaliacaoId: ['', Validators.required]
    });

    this.configuracaoForm = this.fb.group({
      escola: ['', Validators.required],
      turma: ['', Validators.required],
      ano: ['2024', Validators.required],
      dataInicioAvaliacao: [new Date(), Validators.required],
      disponivel: [true]
    });

    this.alunosForm = this.fb.group({});

    this.alunosFiltrados = of(this.usuarios);
  }

  ngOnInit(): void {
    this.carregarDados();
    this.setupFormSubscriptions();
  }

  private carregarDados(): void {
    // Carregar avaliações
    this.avaliacaoService.getAvaliacoes().subscribe({
      next: (avaliacoes) => {
        this.avaliacoes = avaliacoes;
      },
      error: (error) => {
        console.error('Erro ao carregar avaliações:', error);
        this.snackBar.open(extractErrorMessage(error), 'Fechar', { duration: 5000 });
      }
    });

    // Carregar usuários (alunos)
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios) => {
        // Filtrar apenas alunos (assumindo que alunos não têm role de admin/professor)
        this.usuarios = usuarios.filter(u => 
          !u.roles || u.roles.length === 0 || !u.roles.includes('ROLE_ADMIN')
        );
        this.alunosFiltrados = of(this.usuarios);
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.snackBar.open(extractErrorMessage(error), 'Fechar', { duration: 5000 });
      }
    });
  }

  private setupFormSubscriptions(): void {
    this.avaliacaoForm.get('avaliacaoId')?.valueChanges.subscribe(avaliacaoId => {
      this.avaliacaoSelecionada = this.avaliacoes.find(a => a.id === avaliacaoId);
    });
  }

  getInstrucaoPreview(instrucao: string | undefined): string {
    if (!instrucao) return 'Sem instrução';
    return instrucao.length > 50 ? instrucao.substring(0, 50) + '...' : instrucao;
  }

  filterAlunos(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.alunosFiltrados = of(
      this.usuarios.filter(usuario => 
        usuario.nome.toLowerCase().includes(filterValue) ||
        usuario.email.toLowerCase().includes(filterValue)
      ).filter(usuario => 
        !this.alunosSelecionados.find(selected => selected.id === usuario.id)
      )
    );
  }

  adicionarAluno(aluno: Usuario): void {
    if (!this.alunosSelecionados.find(selected => selected.id === aluno.id)) {
      this.alunosSelecionados.push(aluno);
      // Limpar o input
      const input = document.querySelector('input[matAutocomplete]') as HTMLInputElement;
      if (input) {
        input.value = '';
      }
      // Refilter para remover o aluno selecionado da lista
      this.alunosFiltrados = of(
        this.usuarios.filter(usuario => 
          !this.alunosSelecionados.find(selected => selected.id === usuario.id)
        )
      );
    }
  }

  removerAluno(aluno: Usuario): void {
    this.alunosSelecionados = this.alunosSelecionados.filter(selected => selected.id !== aluno.id);
    // Atualizar lista filtrada
    this.alunosFiltrados = of(
      this.usuarios.filter(usuario => 
        !this.alunosSelecionados.find(selected => selected.id === usuario.id)
      )
    );
  }

  criarAplicacao(): void {
    if (this.avaliacaoForm.valid && this.configuracaoForm.valid && this.alunosSelecionados.length > 0) {
      const avaliacaoId = this.avaliacaoForm.get('avaliacaoId')?.value;
      const configuracao = this.configuracaoForm.value;

      // Criar participantes para cada aluno selecionado
      const participantes: Partial<ParticipanteAvaliacao>[] = this.alunosSelecionados.map(aluno => ({
        avaliacaoId: avaliacaoId,
        usuarioId: aluno.id,
        ano: configuracao.ano,
        escola: configuracao.escola,
        turma: configuracao.turma,
        disponivel: configuracao.disponivel,
        dataInicioAvaliacao: configuracao.dataInicioAvaliacao,
        statusAplicacaoId: StatusAplicacaoEnum.PENDENTE,
        avaliado: false,
        dataCadastro: new Date()
      }));

      // Simular criação (em uma implementação real, seria uma chamada ao backend)
      console.log('Criando aplicação com participantes:', participantes);

      this.snackBar.open(
        `Aplicação criada com sucesso para ${this.alunosSelecionados.length} aluno(s)!`, 
        'Fechar', 
        { duration: 3000 }
      );

      // Redirecionar para a lista de aplicações
      this.router.navigate(['/aplicacoes']);
    }
  }
}

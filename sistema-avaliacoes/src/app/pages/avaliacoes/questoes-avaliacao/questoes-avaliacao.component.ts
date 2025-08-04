import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';
import { 
  AvaliacaoQuestao, 
  Questao, 
  Avaliacao 
} from '../../../models';
import { AvaliacaoQuestaoService } from '../../../services/avaliacao-questao.service';
import { AvaliacaoService } from '../../../services/avaliacao.service';
import { extractErrorMessage } from '../../../utils/error-utils';

@Component({
  selector: 'app-questoes-avaliacao',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    DragDropModule
  ],
  template: `
    <div class="questoes-container">
      <!-- Header -->
      <div class="header-section">
        <button mat-icon-button routerLink="/avaliacoes" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1>Questões da Avaliação</h1>
          <p *ngIf="avaliacao">{{ avaliacao.instrucao }}</p>
        </div>
      </div>

      <div class="content-grid">
        <!-- Questões da Avaliação -->
        <mat-card class="questoes-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>quiz</mat-icon>
              Questões Vinculadas ({{ questoesDaAvaliacao.length }})
            </mat-card-title>
            <div class="header-actions">
              <button mat-raised-button color="primary" (click)="abrirModalAdicionar()">
                <mat-icon>add</mat-icon>
                Adicionar Questões
              </button>
            </div>
          </mat-card-header>

          <mat-card-content>
            <div class="loading-container" *ngIf="carregandoQuestoes">
              <mat-spinner diameter="50"></mat-spinner>
              <p>Carregando questões...</p>
            </div>

            <div class="questoes-list" *ngIf="!carregandoQuestoes">
              <div class="questoes-info" *ngIf="questoesDaAvaliacao.length === 0">
                <mat-icon class="empty-icon">quiz</mat-icon>
                <h3>Nenhuma questão vinculada</h3>
                <p>Adicione questões para compor esta avaliação.</p>
                <button mat-raised-button color="primary" (click)="abrirModalAdicionar()">
                  <mat-icon>add</mat-icon>
                  Adicionar Primeira Questão
                </button>
              </div>

              <div 
                class="questoes-drag-list" 
                cdkDropList 
                (cdkDropListDropped)="reordenarQuestoes($event)"
                *ngIf="questoesDaAvaliacao.length > 0">
                
                <div 
                  class="questao-item" 
                  *ngFor="let aq of questoesDaAvaliacao; let i = index"
                  cdkDrag>
                  
                  <div class="questao-drag-handle" cdkDragHandle>
                    <mat-icon>drag_indicator</mat-icon>
                  </div>

                  <div class="questao-content">
                    <div class="questao-header">
                      <span class="questao-ordem">{{ aq.ordem || i + 1 }}</span>
                      <span class="questao-pontos">{{ aq.questao?.pontuacao || 0 }} pts</span>
                      <mat-chip-set>
                        <mat-chip>{{ aq.questao?.disciplina?.descricao }}</mat-chip>
                        <mat-chip color="accent">{{ aq.questao?.tipoAlternativa?.descricao }}</mat-chip>
                      </mat-chip-set>
                    </div>
                    
                    <div class="questao-pergunta">
                      {{ aq.questao?.pergunta }}
                    </div>
                  </div>

                  <div class="questao-actions">
                    <button mat-icon-button [matMenuTriggerFor]="questaoMenu" [matMenuTriggerData]="{ questao: aq }">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Questões Disponíveis -->
        <mat-card class="disponiveis-card" *ngIf="mostrarDisponiveis">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>library_add</mat-icon>
              Questões Disponíveis
            </mat-card-title>
            <div class="header-actions">
              <button mat-icon-button (click)="fecharDisponiveis()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </mat-card-header>

          <mat-card-content>
            <!-- Filtros -->
            <div class="filtros-section">
              <mat-form-field appearance="outline">
                <mat-label>Buscar questões</mat-label>
                <input matInput [formControl]="filtroQuestoes" placeholder="Digite para buscar...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Disciplina</mat-label>
                <mat-select [formControl]="filtroDisciplina">
                  <mat-option value="">Todas</mat-option>
                  <mat-option *ngFor="let disciplina of disciplinasDisponiveis" [value]="disciplina">
                    {{ disciplina }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Seleção múltipla -->
            <div class="selecao-multipla" *ngIf="questoesDisponiveisFiltradas.length > 0">
              <mat-checkbox 
                [checked]="selection.hasValue() && isAllSelected()" 
                [indeterminate]="selection.hasValue() && !isAllSelected()"
                (change)="masterToggle()">
                Selecionar todas ({{ questoesDisponiveisFiltradas.length }})
              </mat-checkbox>
              
              <button 
                mat-raised-button 
                color="primary" 
                [disabled]="!selection.hasValue()"
                (click)="adicionarQuestoesSelecionadas()">
                <mat-icon>add</mat-icon>
                Adicionar Selecionadas ({{ selection.selected.length }})
              </button>
            </div>

            <!-- Lista de questões disponíveis -->
            <div class="questoes-disponiveis">
              <div class="loading-container" *ngIf="carregandoDisponiveis">
                <mat-spinner diameter="40"></mat-spinner>
                <p>Carregando questões disponíveis...</p>
              </div>

              <div class="questao-disponivel" 
                   *ngFor="let questao of questoesDisponiveisFiltradas"
                   [class.selected]="selection.isSelected(questao)">
                
                <mat-checkbox 
                  [checked]="selection.isSelected(questao)"
                  (change)="$event ? selection.toggle(questao) : null">
                </mat-checkbox>

                <div class="questao-info">
                  <div class="questao-header">
                    <mat-chip-set>
                      <mat-chip>{{ questao.disciplina?.descricao }}</mat-chip>
                      <mat-chip color="accent">{{ questao.tipoAlternativa?.descricao }}</mat-chip>
                      <mat-chip color="warn">{{ questao.pontuacao }} pts</mat-chip>
                    </mat-chip-set>
                  </div>
                  <div class="questao-pergunta">{{ questao.pergunta }}</div>
                </div>

                <div class="questao-actions">
                  <button mat-icon-button 
                          (click)="adicionarQuestaoIndividual(questao)"
                          matTooltip="Adicionar questão">
                    <mat-icon>add_circle</mat-icon>
                  </button>
                </div>
              </div>

              <div class="no-questoes" *ngIf="!carregandoDisponiveis && questoesDisponiveisFiltradas.length === 0">
                <mat-icon>info</mat-icon>
                <p>Nenhuma questão disponível encontrada.</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Menu de ações da questão -->
      <mat-menu #questaoMenu="matMenu">
        <ng-template matMenuContent let-questao="questao">
          <button mat-menu-item (click)="removerQuestao(questao)">
            <mat-icon color="warn">delete</mat-icon>
            Remover da Avaliação
          </button>
        </ng-template>
      </mat-menu>
    </div>
  `,
  styles: [`
    .questoes-container {
      padding: 20px;
    }

    .header-section {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
    }

    .back-button {
      margin-right: 16px;
    }

    .header-content h1 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .header-content p {
      margin: 0;
      color: #666;
      font-size: 0.9em;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .content-grid.with-disponiveis {
      grid-template-columns: 1fr 1fr;
    }

    .questoes-card, .disponiveis-card {
      height: fit-content;
    }

    .header-actions {
      margin-left: auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: #666;
    }

    .questoes-info {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .questoes-drag-list {
      min-height: 100px;
    }

    .questao-item {
      display: flex;
      align-items: center;
      padding: 16px;
      margin-bottom: 8px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      transition: all 0.2s;
    }

    .questao-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .questao-item.cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .questao-drag-handle {
      margin-right: 12px;
      color: #999;
      cursor: grab;
    }

    .questao-drag-handle:active {
      cursor: grabbing;
    }

    .questao-content {
      flex: 1;
    }

    .questao-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .questao-ordem {
      background: #1976d2;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }

    .questao-pontos {
      font-weight: bold;
      color: #4caf50;
      font-size: 0.9em;
    }

    .questao-pergunta {
      color: #333;
      font-weight: 500;
      line-height: 1.4;
    }

    .filtros-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .selecao-multipla {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .questao-disponivel {
      display: flex;
      align-items: center;
      padding: 12px;
      margin-bottom: 8px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .questao-disponivel:hover {
      background: #f9f9f9;
    }

    .questao-disponivel.selected {
      background: #e3f2fd;
      border-color: #2196f3;
    }

    .questao-info {
      flex: 1;
      margin-left: 12px;
    }

    .no-questoes {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    @media (max-width: 1024px) {
      .content-grid.with-disponiveis {
        grid-template-columns: 1fr;
      }

      .filtros-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class QuestoesAvaliacaoComponent implements OnInit {
  avaliacaoId!: number;
  avaliacao: Avaliacao | null = null;
  questoesDaAvaliacao: AvaliacaoQuestao[] = [];
  questoesDisponiveis: Questao[] = [];
  questoesDisponiveisFiltradas: Questao[] = [];
  
  carregandoQuestoes = false;
  carregandoDisponiveis = false;
  mostrarDisponiveis = false;

  // Filtros
  filtroQuestoes = new FormControl('');
  filtroDisciplina = new FormControl('');
  disciplinasDisponiveis: string[] = [];

  // Seleção múltipla
  selection = new SelectionModel<Questao>(true, []);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private avaliacaoQuestaoService: AvaliacaoQuestaoService,
    private avaliacaoService: AvaliacaoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.avaliacaoId = +params['id'];
      this.carregarDados();
    });

    this.setupFiltros();
  }

  private carregarDados(): void {
    this.carregarAvaliacao();
    this.carregarQuestoesDaAvaliacao();
  }

  private carregarAvaliacao(): void {
    this.avaliacaoService.getAvaliacao(this.avaliacaoId).subscribe({
      next: (avaliacao) => {
        this.avaliacao = avaliacao;
      },
      error: (error) => {
        console.log('❌ Erro ao carregar avaliação:', error);
        const message = extractErrorMessage(error);
        this.snackBar.open(message, 'Fechar', { duration: 5000 });
      }
    });
  }

  private carregarQuestoesDaAvaliacao(): void {
    this.carregandoQuestoes = true;
    this.avaliacaoQuestaoService.getQuestoesDaAvaliacao(this.avaliacaoId).subscribe({
      next: (response) => {
        this.questoesDaAvaliacao = response.data || [];
        this.carregandoQuestoes = false;
      },
      error: (error) => {
        console.log('❌ Erro ao carregar questões da avaliação:', error);
        this.carregandoQuestoes = false;
        const message = extractErrorMessage(error);
        this.snackBar.open(message, 'Fechar', { duration: 5000 });
      }
    });
  }

  abrirModalAdicionar(): void {
    this.mostrarDisponiveis = true;
    this.carregarQuestoesDisponiveis();
  }

  fecharDisponiveis(): void {
    this.mostrarDisponiveis = false;
    this.selection.clear();
  }

  private carregarQuestoesDisponiveis(): void {
    this.carregandoDisponiveis = true;
    this.avaliacaoQuestaoService.getQuestoesDisponiveis(this.avaliacaoId).subscribe({
      next: (response) => {
        this.questoesDisponiveis = response.data || [];
        this.questoesDisponiveisFiltradas = [...this.questoesDisponiveis];
        this.extrairDisciplinas();
        this.carregandoDisponiveis = false;
      },
      error: (error) => {
        console.log('❌ Erro ao carregar questões disponíveis:', error);
        this.carregandoDisponiveis = false;
        const message = extractErrorMessage(error);
        this.snackBar.open(message, 'Fechar', { duration: 5000 });
      }
    });
  }

  private extrairDisciplinas(): void {
    const disciplinas = new Set<string>();
    this.questoesDisponiveis.forEach(q => {
      if (q.disciplina?.descricao) {
        disciplinas.add(q.disciplina.descricao);
      }
    });
    this.disciplinasDisponiveis = Array.from(disciplinas).sort();
  }

  private setupFiltros(): void {
    this.filtroQuestoes.valueChanges.subscribe(() => this.aplicarFiltros());
    this.filtroDisciplina.valueChanges.subscribe(() => this.aplicarFiltros());
  }

  private aplicarFiltros(): void {
    let questoesFiltradas = [...this.questoesDisponiveis];

    // Filtro por texto
    const textoFiltro = this.filtroQuestoes.value?.toLowerCase() || '';
    if (textoFiltro) {
      questoesFiltradas = questoesFiltradas.filter(q =>
        q.pergunta?.toLowerCase().includes(textoFiltro) ||
        q.disciplina?.descricao?.toLowerCase().includes(textoFiltro)
      );
    }

    // Filtro por disciplina
    const disciplinaFiltro = this.filtroDisciplina.value;
    if (disciplinaFiltro) {
      questoesFiltradas = questoesFiltradas.filter(q =>
        q.disciplina?.descricao === disciplinaFiltro
      );
    }

    this.questoesDisponiveisFiltradas = questoesFiltradas;
    this.selection.clear();
  }

  // Seleção múltipla
  isAllSelected(): boolean {
    return this.selection.selected.length === this.questoesDisponiveisFiltradas.length;
  }

  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.questoesDisponiveisFiltradas.forEach(row => this.selection.select(row));
  }

  adicionarQuestaoIndividual(questao: Questao): void {
    if (!questao.id) return;

    const request = {
      avaliacaoId: this.avaliacaoId,
      questaoId: questao.id
    };

    this.avaliacaoQuestaoService.adicionarQuestao(request).subscribe({
      next: (response) => {
        this.snackBar.open('Questão adicionada com sucesso!', 'Fechar', { duration: 3000 });
        this.carregarQuestoesDaAvaliacao();
        this.carregarQuestoesDisponiveis();
      },
      error: (error) => {
        console.log('❌ Erro ao adicionar questão:', error);
        const message = extractErrorMessage(error);
        this.snackBar.open(message, 'Fechar', { duration: 5000 });
      }
    });
  }

  adicionarQuestoesSelecionadas(): void {
    const questoesIds = this.selection.selected
      .map(q => q.id)
      .filter(id => id !== undefined) as number[];

    if (questoesIds.length === 0) return;

    const request = { questoesIds };

    this.avaliacaoQuestaoService.adicionarMultiplasQuestoes(this.avaliacaoId, request).subscribe({
      next: (response) => {
        this.snackBar.open(`${questoesIds.length} questões adicionadas com sucesso!`, 'Fechar', { duration: 3000 });
        this.carregarQuestoesDaAvaliacao();
        this.carregarQuestoesDisponiveis();
        this.selection.clear();
      },
      error: (error) => {
        console.log('❌ Erro ao adicionar questões:', error);
        const message = extractErrorMessage(error);
        this.snackBar.open(message, 'Fechar', { duration: 5000 });
      }
    });
  }

  removerQuestao(avaliacaoQuestao: AvaliacaoQuestao): void {
    if (!avaliacaoQuestao.id) return;

    if (confirm('Tem certeza que deseja remover esta questão da avaliação?')) {
      this.avaliacaoQuestaoService.removerQuestao(avaliacaoQuestao.id).subscribe({
        next: () => {
          this.snackBar.open('Questão removida com sucesso!', 'Fechar', { duration: 3000 });
          this.carregarQuestoesDaAvaliacao();
          if (this.mostrarDisponiveis) {
            this.carregarQuestoesDisponiveis();
          }
        },
        error: (error) => {
          console.log('❌ Erro ao remover questão:', error);
          const message = extractErrorMessage(error);
          this.snackBar.open(message, 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  reordenarQuestoes(event: CdkDragDrop<AvaliacaoQuestao[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(this.questoesDaAvaliacao, event.previousIndex, event.currentIndex);

    // Atualizar ordens
    const ordens: { [questaoId: number]: number } = {};
    this.questoesDaAvaliacao.forEach((aq, index) => {
      if (aq.questaoId) {
        ordens[aq.questaoId] = index + 1;
        aq.ordem = index + 1;
      }
    });

    const request = { ordens };

    this.avaliacaoQuestaoService.reordenarQuestoes(this.avaliacaoId, request).subscribe({
      next: () => {
        this.snackBar.open('Ordem das questões atualizada!', 'Fechar', { duration: 2000 });
      },
      error: (error) => {
        console.log('❌ Erro ao reordenar questões:', error);
        // Reverter alteração visual
        this.carregarQuestoesDaAvaliacao();
        const message = extractErrorMessage(error);
        this.snackBar.open(message, 'Fechar', { duration: 5000 });
      }
    });
  }
}

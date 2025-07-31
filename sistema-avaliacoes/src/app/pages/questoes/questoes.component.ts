import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { Questao, TipoAlternativaEnum, NivelDificuldadeEnum } from '../../models';

@Component({
  selector: 'app-questoes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatExpansionModule
  ],
  template: `
    <div class="questoes-container">
      <div class="header-section">
        <h1>Banco de Questões</h1>
        <div class="header-actions">
          <button mat-button color="primary" (click)="importarQuestoes()">
            <mat-icon>upload</mat-icon>
            Importar
          </button>
          <button mat-raised-button color="primary" routerLink="/questoes/nova">
            <mat-icon>add</mat-icon>
            Nova Questão
          </button>
        </div>
      </div>

      <mat-expansion-panel class="filters-panel">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>filter_list</mat-icon>
            Filtros Avançados
          </mat-panel-title>
        </mat-expansion-panel-header>
        
        <div class="filters-content">
          <div class="filters-row">
            <mat-form-field>
              <mat-label>Buscar</mat-label>
              <input matInput placeholder="Buscar por pergunta..." (keyup)="applyFilter($event)">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Disciplina</mat-label>
              <mat-select (selectionChange)="filterByDisciplina($event.value)">
                <mat-option value="">Todas as disciplinas</mat-option>
                <mat-option value="Matemática">Matemática</mat-option>
                <mat-option value="Português">Português</mat-option>
                <mat-option value="História">História</mat-option>
                <mat-option value="Geografia">Geografia</mat-option>
                <mat-option value="Ciências">Ciências</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Tipo de Alternativa</mat-label>
              <mat-select (selectionChange)="filterByTipoAlternativa($event.value)">
                <mat-option value="">Todos os tipos</mat-option>
                <mat-option value="Dissertativa">Dissertativa</mat-option>
                <mat-option value="Múltipla Escolha">Múltipla Escolha</mat-option>
                <mat-option value="Texto de Referência">Texto de Referência</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Nível de Dificuldade</mat-label>
              <mat-select (selectionChange)="filterByDificuldade($event.value)">
                <mat-option value="">Todos os níveis</mat-option>
                <mat-option value="Fácil">Fácil</mat-option>
                <mat-option value="Médio">Médio</mat-option>
                <mat-option value="Difícil">Difícil</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="filters-row">
            <mat-form-field>
              <mat-label>Ciclo</mat-label>
              <mat-select (selectionChange)="filterByCiclo($event.value)">
                <mat-option value="">Todos os ciclos</mat-option>
                <mat-option value="Fundamental I">Fundamental I</mat-option>
                <mat-option value="Fundamental II">Fundamental II</mat-option>
                <mat-option value="Médio">Médio</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Fase</mat-label>
              <mat-select (selectionChange)="filterByFase($event.value)">
                <mat-option value="">Todas as fases</mat-option>
                <mat-option value="1º Ano">1º Ano</mat-option>
                <mat-option value="2º Ano">2º Ano</mat-option>
                <mat-option value="3º Ano">3º Ano</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Origem</mat-label>
              <mat-select (selectionChange)="filterByOrigem($event.value)">
                <mat-option value="">Todas</mat-option>
                <mat-option value="true">Gerada por IA</mat-option>
                <mat-option value="false">Criada Manualmente</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
      </mat-expansion-panel>

      <mat-card class="table-card">
        <div class="table-header">
          <div class="table-info">
            <span>{{ questoes.length }} questões encontradas</span>
          </div>
          <div class="bulk-actions">
            <button mat-button (click)="exportarSelecionadas()" [disabled]="!hasSelection()">
              <mat-icon>download</mat-icon>
              Exportar Selecionadas
            </button>
          </div>
        </div>

        <table mat-table [dataSource]="questoes" class="questoes-table" matSort>


          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let questao">{{ questao.id }}</td>
          </ng-container>

          <ng-container matColumnDef="pergunta">
            <th mat-header-cell *matHeaderCellDef>Pergunta</th>
            <td mat-cell *matCellDef="let questao">
              <div class="pergunta-cell" [matTooltip]="questao.pergunta">
                {{ getPerguntaPreview(questao.pergunta) }}
              </div>
              <div class="questao-badges">
                <mat-chip *ngIf="questao.geradorIa" color="accent" class="small-chip">
                  <mat-icon>smart_toy</mat-icon>
                  IA
                </mat-chip>
                <mat-chip *ngIf="questao.arquivoImagem" color="primary" class="small-chip">
                  <mat-icon>image</mat-icon>
                </mat-chip>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="disciplina">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Disciplina</th>
            <td mat-cell *matCellDef="let questao">
              <mat-chip color="primary">
                {{ questao.disciplina?.descricao || 'Não informada' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="tipoAlternativa">
            <th mat-header-cell *matHeaderCellDef>Tipo</th>
            <td mat-cell *matCellDef="let questao">
              <mat-chip [color]="getTipoAlternativaColor(questao.tipoAlternativa?.descricao)">
                {{ questao.tipoAlternativa?.descricao }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="nivelDificuldade">
            <th mat-header-cell *matHeaderCellDef>Dificuldade</th>
            <td mat-cell *matCellDef="let questao">
              <mat-chip [color]="getDificuldadeColor(questao.nivelDificuldade?.descricao)">
                {{ questao.nivelDificuldade?.descricao || 'Não definida' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="pontuacao">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Pontuação</th>
            <td mat-cell *matCellDef="let questao">{{ questao.pontuacao || 0 }}</td>
          </ng-container>

          <ng-container matColumnDef="tema">
            <th mat-header-cell *matHeaderCellDef>Tema</th>
            <td mat-cell *matCellDef="let questao">
              <span class="tema-text">{{ questao.tema || '-' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Ações</th>
            <td mat-cell *matCellDef="let questao">
              <button mat-icon-button [matMenuTriggerFor]="actionsMenu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #actionsMenu="matMenu">
                <button mat-menu-item (click)="visualizarQuestao(questao)">
                  <mat-icon>visibility</mat-icon>
                  Visualizar
                </button>
                <button mat-menu-item [routerLink]="['/questoes', questao.id, 'editar']">
                  <mat-icon>edit</mat-icon>
                  Editar
                </button>
                <button mat-menu-item (click)="duplicarQuestao(questao)">
                  <mat-icon>content_copy</mat-icon>
                  Duplicar
                </button>
                <button mat-menu-item (click)="adicionarProblema(questao)">
                  <mat-icon>report_problem</mat-icon>
                  Reportar Problema
                </button>

                <button mat-menu-item (click)="deleteQuestao(questao)" color="warn">
                  <mat-icon color="warn">delete</mat-icon>
                  Excluir
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator 
          [pageSizeOptions]="[5, 10, 25, 50]" 
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .questoes-container {
      padding: 20px;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .filters-panel {
      margin-bottom: 20px;
    }

    .filters-content {
      padding: 16px 0;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .filters-row mat-form-field {
      min-width: 200px;
      flex: 1;
    }

    .table-card {
      overflow-x: auto;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #eee;
    }

    .table-info {
      color: #666;
      font-size: 0.9em;
    }

    .bulk-actions {
      display: flex;
      gap: 8px;
    }

    .questoes-table {
      width: 100%;
    }

    .pergunta-cell {
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 4px;
    }

    .questao-badges {
      display: flex;
      gap: 4px;
    }

    .small-chip {
      font-size: 0.7em;
      min-height: 20px;
      
      .mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .tema-text {
      font-size: 0.9em;
      color: #666;
    }

    .mat-column-select {
      width: 50px;
    }

    .mat-column-id {
      width: 80px;
    }

    .mat-column-pontuacao {
      width: 100px;
    }

    .mat-column-actions {
      width: 80px;
    }

    .mat-column-tipoAlternativa,
    .mat-column-nivelDificuldade {
      width: 130px;
    }
  `]
})
export class QuestoesComponent implements OnInit {
  displayedColumns: string[] = ['id', 'pergunta', 'disciplina', 'tipoAlternativa', 'nivelDificuldade', 'pontuacao', 'tema', 'actions'];
  
  questoes: Questao[] = [
    {
      id: 1,
      dataCadastro: new Date('2024-01-15'),
      pergunta: 'Qual é a capital do Brasil? Explique a importância histórica e política da cidade escolhida.',
      geradorIa: false,
      statusQuestaoId: 1,
      disciplinaId: 1,
      disciplina: { id: 1, descricao: 'Geografia', idDisciplinaExterno: 'geo001', status: true },
      pontuacao: 2.5,
      tipoAlternativaId: 1,
      tipoAlternativa: { id: 1, descricao: TipoAlternativaEnum.DISSERTATIVA, status: true },
      nivelDificuldadeId: 1,
      nivelDificuldade: { id: 1, descricao: NivelDificuldadeEnum.FACIL, status: true },
      ciclo: 'Fundamental II',
      fase: '6º Ano',
      tema: 'Capitais do Brasil',
      habilidades: 'Identificar capitais, compreender organização política'
    },
    {
      id: 2,
      dataCadastro: new Date('2024-02-10'),
      pergunta: 'Resolva a equação: 2x + 5 = 15',
      geradorIa: true,
      statusQuestaoId: 1,
      disciplinaId: 2,
      disciplina: { id: 2, descricao: 'Matemática', idDisciplinaExterno: 'mat001', status: true },
      pontuacao: 3,
      tipoAlternativaId: 2,
      tipoAlternativa: { id: 2, descricao: TipoAlternativaEnum.MULTIPLA_ESCOLHA, status: true },
      nivelDificuldadeId: 2,
      nivelDificuldade: { id: 2, descricao: NivelDificuldadeEnum.MEDIO, status: true },
      ciclo: 'Fundamental II',
      fase: '7º Ano',
      tema: 'Equações do 1º Grau',
      habilidades: 'Resolver equações lineares',
      alternativas: [
        { id: 1, questaoId: 2, alternativa: 'A', conteudo: 'x = 5', correta: true },
        { id: 2, questaoId: 2, alternativa: 'B', conteudo: 'x = 10', correta: false },
        { id: 3, questaoId: 2, alternativa: 'C', conteudo: 'x = 7', correta: false },
        { id: 4, questaoId: 2, alternativa: 'D', conteudo: 'x = 3', correta: false }
      ]
    }
  ];



  constructor() {}

  ngOnInit(): void {}

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log('Filtrar por:', filterValue);
  }

  filterByDisciplina(disciplina: string): void {
    console.log('Filtrar por disciplina:', disciplina);
  }

  filterByTipoAlternativa(tipo: string): void {
    console.log('Filtrar por tipo alternativa:', tipo);
  }

  filterByDificuldade(dificuldade: string): void {
    console.log('Filtrar por dificuldade:', dificuldade);
  }

  filterByCiclo(ciclo: string): void {
    console.log('Filtrar por ciclo:', ciclo);
  }

  filterByFase(fase: string): void {
    console.log('Filtrar por fase:', fase);
  }

  filterByOrigem(origem: string): void {
    console.log('Filtrar por origem:', origem);
  }

  importarQuestoes(): void {
    console.log('Importar questões');
  }

  exportarSelecionadas(): void {
    console.log('Exportar questões selecionadas');
  }

  visualizarQuestao(questao: Questao): void {
    console.log('Visualizar questão:', questao);
  }

  duplicarQuestao(questao: Questao): void {
    console.log('Duplicar questão:', questao);
  }

  adicionarProblema(questao: Questao): void {
    console.log('Reportar problema:', questao);
  }

  deleteQuestao(questao: Questao): void {
    console.log('Excluir questão:', questao);
  }



  getPerguntaPreview(pergunta: string): string {
    return pergunta.length > 60 ? pergunta.substring(0, 60) + '...' : pergunta;
  }

  getTipoAlternativaColor(tipo: string | undefined): 'primary' | 'accent' | 'warn' {
    switch (tipo) {
      case TipoAlternativaEnum.DISSERTATIVA: return 'primary';
      case TipoAlternativaEnum.MULTIPLA_ESCOLHA: return 'accent';
      case TipoAlternativaEnum.TEXTO_REFERENCIA: return 'warn';
      default: return 'primary';
    }
  }

  getDificuldadeColor(dificuldade: string | undefined): 'primary' | 'accent' | 'warn' {
    switch (dificuldade) {
      case NivelDificuldadeEnum.FACIL: return 'primary';
      case NivelDificuldadeEnum.MEDIO: return 'accent';
      case NivelDificuldadeEnum.DIFICIL: return 'warn';
      default: return 'primary';
    }
  }
}

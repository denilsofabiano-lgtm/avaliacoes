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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ParticipanteAvaliacao, StatusAplicacaoEnum } from '../../models';

@Component({
  selector: 'app-aplicacoes',
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
    MatProgressBarModule
  ],
  template: `
    <div class="aplicacoes-container">
      <div class="header-section">
        <h1>Aplicações de Avaliações</h1>
        <button mat-raised-button color="primary" (click)="novaAplicacao()">
          <mat-icon>add</mat-icon>
          Nova Aplicação
        </button>
      </div>

      <div class="stats-cards">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ getCount('pendente') }}</div>
            <div class="stat-label">Pendentes</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ getCount('andamento') }}</div>
            <div class="stat-label">Em Andamento</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ getCount('concluido') }}</div>
            <div class="stat-label">Concluídas</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ participantes.length }}</div>
            <div class="stat-label">Total</div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field>
              <mat-label>Buscar</mat-label>
              <input matInput placeholder="Nome do aluno..." (keyup)="applyFilter($event)">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="filterByStatus($event.value)">
                <mat-option value="">Todos os status</mat-option>
                <mat-option value="0">Pendente</mat-option>
                <mat-option value="1">Iniciado</mat-option>
                <mat-option value="2">Em Andamento</mat-option>
                <mat-option value="3">Concluído</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Escola</mat-label>
              <mat-select (selectionChange)="filterByEscola($event.value)">
                <mat-option value="">Todas as escolas</mat-option>
                <mat-option value="Escola Municipal Santos">Escola Municipal Santos</mat-option>
                <mat-option value="Colégio Estadual Silva">Colégio Estadual Silva</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Turma</mat-label>
              <mat-select (selectionChange)="filterByTurma($event.value)">
                <mat-option value="">Todas as turmas</mat-option>
                <mat-option value="7A">7A</mat-option>
                <mat-option value="7B">7B</mat-option>
                <mat-option value="8A">8A</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="participantes" class="aplicacoes-table" matSort>
          <ng-container matColumnDef="usuario">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Aluno</th>
            <td mat-cell *matCellDef="let participante">
              <div class="user-info">
                <div class="user-name">{{ participante.usuario?.nome }}</div>
                <div class="user-email">{{ participante.usuario?.email }}</div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="avaliacao">
            <th mat-header-cell *matHeaderCellDef>Avaliação</th>
            <td mat-cell *matCellDef="let participante">
              <div class="avaliacao-info">
                <div class="avaliacao-tipo">{{ participante.avaliacao?.tipoAvaliacao?.descricao }}</div>
                <div class="avaliacao-instrucao">{{ getInstrucaoPreview(participante.avaliacao?.instrucao) }}</div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="escola">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Escola/Turma</th>
            <td mat-cell *matCellDef="let participante">
              <div class="escola-info">
                <div class="escola-nome">{{ participante.escola }}</div>
                <div class="turma-ano">{{ participante.turma }} - {{ participante.ano }}</div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let participante">
              <mat-chip [color]="getStatusColor(participante.statusAplicacaoId)">
                {{ getStatusLabel(participante.statusAplicacaoId) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="progresso">
            <th mat-header-cell *matHeaderCellDef>Progresso</th>
            <td mat-cell *matCellDef="let participante">
              <div class="progresso-info">
                <mat-progress-bar 
                  [value]="getProgresso(participante)" 
                  [color]="getProgressColor(participante)">
                </mat-progress-bar>
                <span class="progresso-text">{{ getProgressoText(participante) }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="tempos">
            <th mat-header-cell *matHeaderCellDef>Tempos</th>
            <td mat-cell *matCellDef="let participante">
              <div class="tempos-info">
                <div *ngIf="participante.dataInicio" class="tempo-item">
                  <mat-icon>play_arrow</mat-icon>
                  {{ formatDateTime(participante.dataInicio) }}
                </div>
                <div *ngIf="participante.dataFim" class="tempo-item">
                  <mat-icon>stop</mat-icon>
                  {{ formatDateTime(participante.dataFim) }}
                </div>
                <div *ngIf="getDuracao(participante)" class="duracao">
                  Duração: {{ getDuracao(participante) }}
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="disponivel">
            <th mat-header-cell *matHeaderCellDef>Disponível</th>
            <td mat-cell *matCellDef="let participante">
              <mat-chip [color]="participante.disponivel ? 'primary' : 'warn'">
                {{ participante.disponivel ? 'Sim' : 'Não' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Ações</th>
            <td mat-cell *matCellDef="let participante">
              <button mat-icon-button [matMenuTriggerFor]="actionsMenu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #actionsMenu="matMenu">
                <button mat-menu-item 
                        [routerLink]="['/aplicacoes', participante.id, 'aplicar']"
                        [disabled]="!canIniciarAplicacao(participante)">
                  <mat-icon>play_circle_filled</mat-icon>
                  Iniciar Aplicação
                </button>
                <button mat-menu-item (click)="visualizarProgresso(participante)">
                  <mat-icon>visibility</mat-icon>
                  Ver Progresso
                </button>
                <button mat-menu-item 
                        (click)="visualizarRespostas(participante)"
                        [disabled]="!participante.avaliado">
                  <mat-icon>quiz</mat-icon>
                  Ver Respostas
                </button>
                <button mat-menu-item (click)="toggleDisponibilidade(participante)">
                  <mat-icon>{{ participante.disponivel ? 'block' : 'check_circle' }}</mat-icon>
                  {{ participante.disponivel ? 'Bloquear' : 'Liberar' }}
                </button>

                <button mat-menu-item (click)="resetarAplicacao(participante)" color="warn">
                  <mat-icon color="warn">refresh</mat-icon>
                  Resetar
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
    .aplicacoes-container {
      padding: 20px;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-card {
      text-align: center;
    }

    .stat-number {
      font-size: 2em;
      font-weight: bold;
      color: #1976d2;
    }

    .stat-label {
      color: #666;
      margin-top: 8px;
    }

    .filters-card {
      margin-bottom: 20px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filters-row mat-form-field {
      min-width: 200px;
      flex: 1;
    }

    .table-card {
      overflow-x: auto;
    }

    .aplicacoes-table {
      width: 100%;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 500;
    }

    .user-email {
      font-size: 0.9em;
      color: #666;
    }

    .avaliacao-info {
      display: flex;
      flex-direction: column;
    }

    .avaliacao-tipo {
      font-weight: 500;
      color: #1976d2;
    }

    .avaliacao-instrucao {
      font-size: 0.9em;
      color: #666;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .escola-info {
      display: flex;
      flex-direction: column;
    }

    .escola-nome {
      font-weight: 500;
    }

    .turma-ano {
      font-size: 0.9em;
      color: #666;
    }

    .progresso-info {
      min-width: 120px;
    }

    .progresso-text {
      font-size: 0.8em;
      color: #666;
      margin-top: 4px;
      display: block;
    }

    .tempos-info {
      font-size: 0.9em;
    }

    .tempo-item {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 2px;
    }

    .tempo-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .duracao {
      color: #666;
      font-weight: 500;
      margin-top: 4px;
    }

    .mat-column-actions {
      width: 80px;
    }

    .mat-column-status,
    .mat-column-disponivel {
      width: 100px;
    }

    .mat-column-progresso {
      width: 150px;
    }

    @media (max-width: 768px) {
      .aplicacoes-container {
        padding: 16px;
      }

      .header-section {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .header-section button {
        width: 100%;
      }

      .filters-row {
        flex-direction: column;
      }

      .filters-row mat-form-field {
        width: 100%;
        min-width: unset;
      }

      .table-card {
        margin: 0 -8px;
      }

      .mat-column-escola,
      .mat-column-tempos,
      .mat-column-disponivel {
        display: none;
      }

      .avaliacao-info {
        max-width: 120px;
      }
    }
  `]
})
export class AplicacoesComponent implements OnInit {
  displayedColumns: string[] = ['usuario', 'avaliacao', 'escola', 'status', 'progresso', 'tempos', 'disponivel', 'actions'];
  
  participantes: ParticipanteAvaliacao[] = [
    {
      id: 1,
      dataCadastro: new Date('2024-01-15'),
      avaliacaoId: 1,
      avaliacao: {
        id: 1,
        tipoAvaliacao: { id: 1, descricao: 'Diagnóstica', status: true },
        instrucao: 'Avaliação diagnóstica de Matemática para o 7º ano',
        responsavel: { id: 1, nome: 'Prof. Ana Silva', email: 'ana@professor.com', cpf: '12345678901', roles: [], status: true },
        statusAvaliacao: { id: 1, descricao: 'Rascunho', status: true }
      },
      usuarioId: 1,
      usuario: { id: 1, nome: 'João Silva', email: 'joao@aluno.com', cpf: '12345678901', roles: [], status: true },
      ano: '2024',
      escola: 'Escola Municipal Santos',
      turma: '7A',
      disponivel: true,
      dataInicioAvaliacao: new Date('2024-01-20'),
      dataInicio: new Date('2024-01-20T09:00:00'),
      dataFim: new Date('2024-01-20T10:30:00'),
      statusAplicacaoId: StatusAplicacaoEnum.CONCLUIDO,
      avaliado: true
    },
    {
      id: 2,
      dataCadastro: new Date('2024-01-15'),
      avaliacaoId: 1,
      avaliacao: {
        id: 1,
        tipoAvaliacao: { id: 1, descricao: 'Diagnóstica', status: true },
        instrucao: 'Avaliação diagnóstica de Matemática para o 7º ano',
        responsavelId: 1,
        statusAvaliacaoId: 1
      },
      usuarioId: 2,
      usuario: { id: 2, nome: 'Maria Santos', email: 'maria@aluno.com', cpf: '98765432109', roles: [], status: true },
      ano: '2024',
      escola: 'Escola Municipal Santos',
      turma: '7A',
      disponivel: true,
      dataInicioAvaliacao: new Date('2024-01-20'),
      dataInicio: new Date('2024-01-20T09:00:00'),
      statusAplicacaoId: StatusAplicacaoEnum.EM_ANDAMENTO,
      avaliado: false
    },
    {
      id: 3,
      dataCadastro: new Date('2024-01-15'),
      avaliacaoId: 2,
      avaliacao: {
        id: 2,
        tipoAvaliacao: { id: 2, descricao: 'Processual', status: true },
        instrucao: 'Avaliação processual de Português',
        responsavelId: 1,
        statusAvaliacaoId: 1
      },
      usuarioId: 3,
      usuario: { id: 3, nome: 'Pedro Oliveira', email: 'pedro@aluno.com', cpf: '11122233344', roles: [], status: true },
      ano: '2024',
      escola: 'Colégio Estadual Silva',
      turma: '8A',
      disponivel: true,
      dataInicioAvaliacao: new Date('2024-01-25'),
      statusAplicacaoId: StatusAplicacaoEnum.PENDENTE,
      avaliado: false
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  getCount(tipo: string): number {
    switch (tipo) {
      case 'pendente':
        return this.participantes.filter(p => p.statusAplicacaoId === StatusAplicacaoEnum.PENDENTE).length;
      case 'andamento':
        return this.participantes.filter(p => 
          p.statusAplicacaoId === StatusAplicacaoEnum.INICIADO || 
          p.statusAplicacaoId === StatusAplicacaoEnum.EM_ANDAMENTO
        ).length;
      case 'concluido':
        return this.participantes.filter(p => p.statusAplicacaoId === StatusAplicacaoEnum.CONCLUIDO).length;
      default:
        return 0;
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log('Filtrar por:', filterValue);
  }

  filterByStatus(status: string): void {
    console.log('Filtrar por status:', status);
  }

  filterByEscola(escola: string): void {
    console.log('Filtrar por escola:', escola);
  }

  filterByTurma(turma: string): void {
    console.log('Filtrar por turma:', turma);
  }

  novaAplicacao(): void {
    console.log('Nova aplicação');
  }

  getInstrucaoPreview(instrucao: string | undefined): string {
    if (!instrucao) return '';
    return instrucao.length > 50 ? instrucao.substring(0, 50) + '...' : instrucao;
  }

  getStatusColor(statusId: number | undefined): 'primary' | 'accent' | 'warn' {
    switch (statusId) {
      case StatusAplicacaoEnum.PENDENTE: return 'warn';
      case StatusAplicacaoEnum.INICIADO: return 'accent';
      case StatusAplicacaoEnum.EM_ANDAMENTO: return 'accent';
      case StatusAplicacaoEnum.CONCLUIDO: return 'primary';
      default: return 'warn';
    }
  }

  getStatusLabel(statusId: number | undefined): string {
    switch (statusId) {
      case StatusAplicacaoEnum.PENDENTE: return 'Pendente';
      case StatusAplicacaoEnum.INICIADO: return 'Iniciado';
      case StatusAplicacaoEnum.EM_ANDAMENTO: return 'Em Andamento';
      case StatusAplicacaoEnum.CONCLUIDO: return 'Concluído';
      default: return 'Indefinido';
    }
  }

  getProgresso(participante: ParticipanteAvaliacao): number {
    switch (participante.statusAplicacaoId) {
      case StatusAplicacaoEnum.PENDENTE: return 0;
      case StatusAplicacaoEnum.INICIADO: return 25;
      case StatusAplicacaoEnum.EM_ANDAMENTO: return 60;
      case StatusAplicacaoEnum.CONCLUIDO: return 100;
      default: return 0;
    }
  }

  getProgressColor(participante: ParticipanteAvaliacao): 'primary' | 'accent' | 'warn' {
    const progress = this.getProgresso(participante);
    if (progress === 100) return 'primary';
    if (progress > 0) return 'accent';
    return 'warn';
  }

  getProgressoText(participante: ParticipanteAvaliacao): string {
    const progress = this.getProgresso(participante);
    return `${progress}%`;
  }

  formatDateTime(date: Date | undefined): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getDuracao(participante: ParticipanteAvaliacao): string {
    if (!participante.dataInicio || !participante.dataFim) return '';
    
    const inicio = new Date(participante.dataInicio).getTime();
    const fim = new Date(participante.dataFim).getTime();
    const duracao = fim - inicio;
    
    const horas = Math.floor(duracao / (1000 * 60 * 60));
    const minutos = Math.floor((duracao % (1000 * 60 * 60)) / (1000 * 60));
    
    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    }
    return `${minutos}min`;
  }

  canIniciarAplicacao(participante: ParticipanteAvaliacao): boolean {
    return participante.disponivel && 
           (participante.statusAplicacaoId === StatusAplicacaoEnum.PENDENTE ||
            participante.statusAplicacaoId === StatusAplicacaoEnum.INICIADO);
  }

  visualizarProgresso(participante: ParticipanteAvaliacao): void {
    console.log('Visualizar progresso:', participante);
  }

  visualizarRespostas(participante: ParticipanteAvaliacao): void {
    console.log('Visualizar respostas:', participante);
  }

  toggleDisponibilidade(participante: ParticipanteAvaliacao): void {
    participante.disponivel = !participante.disponivel;
    console.log('Disponibilidade alterada:', participante);
  }

  resetarAplicacao(participante: ParticipanteAvaliacao): void {
    console.log('Resetar aplicação:', participante);
  }
}

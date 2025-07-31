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
import { Avaliacao, TipoAvaliacaoEnum, StatusAvaliacaoEnum } from '../../models';

@Component({
  selector: 'app-avaliacoes',
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
    MatMenuModule
  ],
  template: `
    <div class="avaliacoes-container">
      <div class="header-section">
        <h1>Gestão de Avaliações</h1>
        <button mat-raised-button color="primary" routerLink="/avaliacoes/nova">
          <mat-icon>add</mat-icon>
          Nova Avaliação
        </button>
      </div>

      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field>
              <mat-label>Buscar</mat-label>
              <input matInput placeholder="Buscar por instruções..." (keyup)="applyFilter($event)">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Tipo de Avaliação</mat-label>
              <mat-select (selectionChange)="filterByType($event.value)">
                <mat-option value="">Todos os tipos</mat-option>
                <mat-option value="Diagnóstica">Diagnóstica</mat-option>
                <mat-option value="Processual">Processual</mat-option>
                <mat-option value="Final de Ciclo">Final de Ciclo</mat-option>
                <mat-option value="Certificadora">Certificadora</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="filterByStatus($event.value)">
                <mat-option value="">Todos</mat-option>
                <mat-option value="0">Pendente</mat-option>
                <mat-option value="1">Aprovado</mat-option>
                <mat-option value="2">Cancelado</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="avaliacoes" class="avaliacoes-table" matSort>
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let avaliacao">{{ avaliacao.id }}</td>
          </ng-container>

          <ng-container matColumnDef="instrucao">
            <th mat-header-cell *matHeaderCellDef>Instrução</th>
            <td mat-cell *matCellDef="let avaliacao">
              <div class="instrucao-cell">
                {{ getInstrucaoPreview(avaliacao.instrucao) }}
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="tipoAvaliacao">
            <th mat-header-cell *matHeaderCellDef>Tipo</th>
            <td mat-cell *matCellDef="let avaliacao">
              <mat-chip [color]="getTipoColor(avaliacao.tipoAvaliacao?.descricao)">
                {{ avaliacao.tipoAvaliacao?.descricao }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="responsavel">
            <th mat-header-cell *matHeaderCellDef>Responsável</th>
            <td mat-cell *matCellDef="let avaliacao">{{ avaliacao.responsavel?.nome }}</td>
          </ng-container>

          <ng-container matColumnDef="questoes">
            <th mat-header-cell *matHeaderCellDef>Questões</th>
            <td mat-cell *matCellDef="let avaliacao">
              <mat-chip color="accent">
                {{ getQuestoesCount(avaliacao) }} questões
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let avaliacao">
              <mat-chip [color]="getStatusColor(avaliacao.statusAvaliacaoId)">
                {{ getStatusLabel(avaliacao.statusAvaliacaoId) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="dataCadastro">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Data Criação</th>
            <td mat-cell *matCellDef="let avaliacao">{{ formatDate(avaliacao.dataCadastro) }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Ações</th>
            <td mat-cell *matCellDef="let avaliacao">
              <button mat-icon-button [matMenuTriggerFor]="actionsMenu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #actionsMenu="matMenu">
                <button mat-menu-item [routerLink]="['/avaliacoes', avaliacao.id, 'editar']">
                  <mat-icon>edit</mat-icon>
                  Editar
                </button>
                <button mat-menu-item (click)="duplicateAvaliacao(avaliacao)">
                  <mat-icon>content_copy</mat-icon>
                  Duplicar
                </button>
                <button mat-menu-item (click)="manageQuestoes(avaliacao)">
                  <mat-icon>quiz</mat-icon>
                  Gerenciar Questões
                </button>
                <button mat-menu-item (click)="aplicarAvaliacao(avaliacao)">
                  <mat-icon>play_circle_filled</mat-icon>
                  Aplicar
                </button>
                <button mat-menu-item (click)="deleteAvaliacao(avaliacao)" color="warn">
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
    .avaliacoes-container {
      padding: 20px;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
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
    }

    .table-card {
      overflow-x: auto;
    }

    .avaliacoes-table {
      width: 100%;
    }

    .mat-column-actions {
      width: 80px;
      text-align: center;
    }

    .mat-column-id {
      width: 80px;
    }

    .mat-column-status,
    .mat-column-questoes {
      width: 120px;
    }

    .instrucao-cell {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `]
})
export class AvaliacoesComponent implements OnInit {
  displayedColumns: string[] = ['id', 'instrucao', 'tipoAvaliacao', 'responsavel', 'questoes', 'status', 'dataCadastro', 'actions'];
  
  avaliacoes: Avaliacao[] = [
    {
      id: 1,
      dataCadastro: new Date('2024-01-15'),
      tipoAvaliacaoId: 1,
      tipoAvaliacao: { id: 1, descricao: TipoAvaliacaoEnum.DIAGNOSTICA, status: true },
      instrucao: 'Avaliação diagnóstica de Matemática para identificar o nível de conhecimento dos alunos no início do semestre.',
      responsavelId: 1,
      responsavel: { id: 1, nome: 'Prof. Maria Silva', email: 'maria@escola.com', cpf: '12345678901', roles: [], status: true },
      statusAvaliacaoId: 1
    },
    {
      id: 2,
      dataCadastro: new Date('2024-02-20'),
      tipoAvaliacaoId: 2,
      tipoAvaliacao: { id: 2, descricao: TipoAvaliacaoEnum.PROCESSUAL, status: true },
      instrucao: 'Avaliação processual de Português focada em interpretação de texto e gramática.',
      responsavelId: 2,
      responsavel: { id: 2, nome: 'Prof. João Santos', email: 'joao@escola.com', cpf: '98765432109', roles: [], status: true },
      statusAvaliacaoId: 1
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log('Filtrar por:', filterValue);
  }

  filterByType(type: string): void {
    console.log('Filtrar por tipo:', type);
  }

  filterByStatus(status: string): void {
    console.log('Filtrar por status:', status);
  }

  duplicateAvaliacao(avaliacao: Avaliacao): void {
    console.log('Duplicar avaliação:', avaliacao);
  }

  manageQuestoes(avaliacao: Avaliacao): void {
    console.log('Gerenciar questões:', avaliacao);
  }

  aplicarAvaliacao(avaliacao: Avaliacao): void {
    console.log('Aplicar avaliação:', avaliacao);
  }

  deleteAvaliacao(avaliacao: Avaliacao): void {
    console.log('Excluir avaliação:', avaliacao);
  }

  getInstrucaoPreview(instrucao: string | undefined): string {
    if (!instrucao) return '';
    return instrucao.length > 80 ? instrucao.substring(0, 80) + '...' : instrucao;
  }

  getQuestoesCount(avaliacao: Avaliacao): number {
    return avaliacao.questoes?.length || 0;
  }

  getTipoColor(tipo: string | undefined): 'primary' | 'accent' | 'warn' {
    switch (tipo) {
      case TipoAvaliacaoEnum.DIAGNOSTICA: return 'primary';
      case TipoAvaliacaoEnum.PROCESSUAL: return 'accent';
      case TipoAvaliacaoEnum.FINAL_CICLO: return 'warn';
      case TipoAvaliacaoEnum.CERTIFICADORA: return 'warn';
      default: return 'primary';
    }
  }

  getStatusColor(statusId: number | undefined): 'primary' | 'accent' | 'warn' {
    switch (statusId) {
      case StatusAvaliacaoEnum.PENDENTE: return 'warn';
      case StatusAvaliacaoEnum.APROVADO: return 'primary';
      case StatusAvaliacaoEnum.CANCELADO: return 'warn';
      default: return 'primary';
    }
  }

  getStatusLabel(statusId: number | undefined): string {
    switch (statusId) {
      case StatusAvaliacaoEnum.PENDENTE: return 'Pendente';
      case StatusAvaliacaoEnum.APROVADO: return 'Aprovado';
      case StatusAvaliacaoEnum.CANCELADO: return 'Cancelado';
      default: return 'Indefinido';
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }
}

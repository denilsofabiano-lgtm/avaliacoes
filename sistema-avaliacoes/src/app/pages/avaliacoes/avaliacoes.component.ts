import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Avaliacao, TipoAvaliacaoEnum, StatusAvaliacaoEnum } from '../../models';
import { AvaliacaoService, AvaliacaoFilters } from '../../services/avaliacao.service';
import { extractErrorMessage } from '../../utils/error-utils';

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
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormsModule
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
              <input matInput placeholder="Buscar por instru��ões..." [(ngModel)]="searchTerm" (keyup)="applyFilter($event)">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Tipo de Avaliação</mat-label>
              <mat-select [(value)]="selectedTipo" (selectionChange)="filterByType($event.value)">
                <mat-option value="">Todos os tipos</mat-option>
                <mat-option value="1">Diagnóstica</mat-option>
                <mat-option value="2">Processual</mat-option>
                <mat-option value="3">Final de Ciclo</mat-option>
                <mat-option value="4">Certificadora</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Status</mat-label>
              <mat-select [(value)]="selectedStatus" (selectionChange)="filterByStatus($event.value)">
                <mat-option value="">Todos</mat-option>
                <mat-option value="1">Pendente</mat-option>
                <mat-option value="2">Aprovado</mat-option>
                <mat-option value="3">Cancelado</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="table-card">
        <div *ngIf="isLoading" class="loading-spinner">
          <mat-spinner></mat-spinner>
          <p>Carregando avaliações...</p>
        </div>

        <table mat-table [dataSource]="avaliacoes" class="avaliacoes-table" matSort *ngIf="!isLoading">
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
          [length]="totalItems"
          [pageSize]="pageSize"
          [pageIndex]="currentPage"
          [pageSizeOptions]="[5, 10, 25, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons
          *ngIf="!isLoading">
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

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }

    .loading-spinner p {
      margin-top: 16px;
      color: #666;
    }

    @media (max-width: 768px) {
      .avaliacoes-container {
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

      .mat-column-id,
      .mat-column-dataCadastro {
        display: none;
      }

      .instrucao-cell {
        max-width: 150px;
      }
    }
  `]
})
export class AvaliacoesComponent implements OnInit {
  displayedColumns: string[] = ['id', 'instrucao', 'tipoAvaliacao', 'responsavel', 'questoes', 'status', 'dataCadastro', 'actions'];

  avaliacoes: Avaliacao[] = [];
  isLoading = false;

  // Paginação
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;

  // Filtros
  searchTerm = '';
  selectedTipo = '';
  selectedStatus = '';

  constructor(
    private avaliacaoService: AvaliacaoService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAvaliacoes();
  }

  loadAvaliacoes(): void {
    this.isLoading = true;

    const filters: AvaliacaoFilters = {
      page: this.currentPage + 1,
      limit: this.pageSize,
      search: this.searchTerm || undefined,
      tipoAvaliacaoId: this.selectedTipo ? parseInt(this.selectedTipo) : undefined,
      statusAvaliacaoId: this.selectedStatus ? parseInt(this.selectedStatus) : undefined
    };

    this.avaliacaoService.getAvaliacoes(filters).subscribe({
      next: (response) => {
        this.avaliacoes = response.data || [];
        this.totalItems = response.pagination?.total || 0;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.log('📋 Avaliações load error:', error);

        const message = extractErrorMessage(error);
        console.log('🎯 Avaliações error message:', message);

        this.snackBar.open(message, 'Fechar', {
          duration: 5000
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAvaliacoes();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm = filterValue.trim();
    this.currentPage = 0;
    this.loadAvaliacoes();
  }

  filterByType(type: string): void {
    this.selectedTipo = type;
    this.currentPage = 0;
    this.loadAvaliacoes();
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 0;
    this.loadAvaliacoes();
  }

  duplicateAvaliacao(avaliacao: Avaliacao): void {
    if (avaliacao.id) {
      this.avaliacaoService.duplicateAvaliacao(avaliacao.id).subscribe({
        next: (response) => {
          this.snackBar.open('Avaliação duplicada com sucesso!', 'Fechar', {
            duration: 3000
          });
          this.loadAvaliacoes();
        },
        error: (error) => {
          console.log('📋 Duplicate avaliação error:', error);
          const message = extractErrorMessage(error);
          this.snackBar.open(message, 'Fechar', {
            duration: 5000
          });
        }
      });
    }
  }

  manageQuestoes(avaliacao: Avaliacao): void {
    // Redirecionar para questões com filtro da avaliação
    this.router.navigate(['/questoes'], {
      queryParams: {
        avaliacao: avaliacao.id,
        manage: true
      }
    });
  }

  aplicarAvaliacao(avaliacao: Avaliacao): void {
    // Redirecionar para página de aplicações da avaliação
    this.router.navigate(['/aplicacoes/nova'], {
      queryParams: {
        avaliacaoId: avaliacao.id
      }
    });
  }

  deleteAvaliacao(avaliacao: Avaliacao): void {
    if (avaliacao.id && confirm('Tem certeza que deseja excluir esta avaliação?')) {
      this.avaliacaoService.deleteAvaliacao(avaliacao.id).subscribe({
        next: (response) => {
          this.snackBar.open('Avaliação excluída com sucesso!', 'Fechar', {
            duration: 3000
          });
          this.loadAvaliacoes();
        },
        error: (error) => {
          console.log('📋 Delete avaliação error:', error);
          const message = extractErrorMessage(error);
          this.snackBar.open(message, 'Fechar', {
            duration: 5000
          });
        }
      });
    }
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

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';

    try {
      // Se for string, converter para Date
      let dateObj: Date;
      if (typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        dateObj = date;
      }

      // Verificar se a data é válida
      if (isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }

      return new Intl.DateTimeFormat('pt-BR').format(dateObj);
    } catch (error) {
      console.log('Error formatting date:', date, error);
      return 'Data inválida';
    }
  }
}

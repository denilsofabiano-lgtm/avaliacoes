import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { RelatorioService, DashboardData } from '../../services/relatorio.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      
      <mat-grid-list [cols]="gridCols" rowHeight="200px" gutterSize="16">
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>people</mat-icon>
                Usuários
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="metric">{{ totalUsuarios }}</div>
              <div class="metric-label">Total de usuários</div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button routerLink="/usuarios">Ver todos</button>
            </mat-card-actions>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>assignment</mat-icon>
                Avaliações
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="metric">{{ totalAvaliacoes }}</div>
              <div class="metric-label">Avaliações criadas</div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button routerLink="/avaliacoes">Gerenciar</button>
            </mat-card-actions>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>quiz</mat-icon>
                Questões
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="metric">{{ totalQuestoes }}</div>
              <div class="metric-label">Banco de questões</div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button routerLink="/questoes">Ver banco</button>
            </mat-card-actions>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>play_circle_filled</mat-icon>
                Aplicações
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="metric">{{ totalAplicacoes }}</div>
              <div class="metric-label">Em andamento</div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button routerLink="/aplicacoes">Acompanhar</button>
            </mat-card-actions>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>

      <div class="recent-activities">
        <h2>Atividades Recentes</h2>
        <mat-card>
          <mat-card-content>
            <div class="activity-item" *ngFor="let activity of recentActivities">
              <mat-icon>{{ activity.icon }}</mat-icon>
              <div class="activity-content">
                <div class="activity-description">{{ activity.description }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }

    .dashboard-card {
      width: 100%;
      height: 180px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .metric {
      font-size: 2.5em;
      font-weight: bold;
      color: #1976d2;
      text-align: center;
    }

    .metric-label {
      color: #666;
      text-align: center;
      margin-top: 8px;
    }

    .recent-activities {
      margin-top: 32px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-content {
      margin-left: 16px;
      flex: 1;
    }

    .activity-description {
      font-weight: 500;
    }

    .activity-time {
      color: #666;
      font-size: 0.9em;
      margin-top: 4px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  totalUsuarios = 0;
  totalAvaliacoes = 0;
  totalQuestoes = 0;
  totalAplicacoes = 0;
  gridCols = 4;
  isLoading = true;
  dashboardData: DashboardData | null = null;

  recentActivities = [
    {
      icon: 'assignment_add',
      description: 'Nova avaliação "Matemática - 3º Ano" criada',
      time: 'há 2 horas'
    },
    {
      icon: 'quiz',
      description: '15 novas questões adicionadas ao banco',
      time: 'há 4 horas'
    },
    {
      icon: 'play_circle_filled',
      description: 'Aplicação iniciada para turma 5A',
      time: 'há 6 horas'
    },
    {
      icon: 'person_add',
      description: 'Novo professor cadastrado: João Silva',
      time: 'há 1 dia'
    }
  ];

  constructor() {}

  ngOnInit(): void {
    this.updateGridCols();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateGridCols();
  }

  updateGridCols(): void {
    const width = window.innerWidth;
    if (width < 768) {
      this.gridCols = 1;
    } else if (width < 1024) {
      this.gridCols = 2;
    } else if (width < 1440) {
      this.gridCols = 3;
    } else {
      this.gridCols = 4;
    }
  }
}

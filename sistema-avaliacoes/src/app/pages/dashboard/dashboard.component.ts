import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { RouterModule, Router } from '@angular/router';
import { RelatorioService, DashboardData } from '../../services/relatorio.service';
import { AplicacaoService } from '../../services/aplicacao.service';
import { AuthService } from '../../services/auth.service';
import { ParticipanteAvaliacao } from '../../models';
import { extractErrorMessage } from '../../utils/error-utils';

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
    MatListModule,
    RouterModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>

      <!-- Dashboard para Alunos -->
      <ng-container *ngIf="isAluno">
        <div class="welcome-section">
          <mat-card class="welcome-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>school</mat-icon>
                Bem-vindo, {{ currentUser?.nome }}!
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Aqui você pode acessar suas avaliações disponíveis e acompanhar seu progresso.</p>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="avaliacoes-section">
          <h2>Suas Avaliações</h2>

          <div class="stats-row">
            <mat-card class="stat-card disponivel">
              <mat-card-content>
                <div class="stat-number">{{ avaliacoesDisponiveis.length }}</div>
                <div class="stat-label">Disponíveis</div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card concluida">
              <mat-card-content>
                <div class="stat-number">{{ avaliacoesConcluidas.length }}</div>
                <div class="stat-label">Concluídas</div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card em-andamento">
              <mat-card-content>
                <div class="stat-number">{{ avaliacoesEmAndamento.length }}</div>
                <div class="stat-label">Em Andamento</div>
              </mat-card-content>
            </mat-card>
          </div>

          <div class="avaliacoes-grid">
            <!-- Avaliações Disponíveis -->
            <mat-card class="avaliacoes-card" *ngIf="avaliacoesDisponiveis.length > 0">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>assignment</mat-icon>
                  Avaliações Disponíveis
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-list>
                  <mat-list-item *ngFor="let avaliacao of avaliacoesDisponiveis">
                    <mat-icon matListItemIcon>assignment</mat-icon>
                    <div matListItemTitle>{{ avaliacao.avaliacao?.instrucao || 'Avaliação sem título' }}</div>
                    <div matListItemLine>{{ avaliacao.avaliacao?.disciplina?.descricao || 'Disciplina não informada' }}</div>
                    <button mat-icon-button (click)="iniciarAvaliacao(avaliacao)" matListItemMeta>
                      <mat-icon>play_arrow</mat-icon>
                    </button>
                  </mat-list-item>
                </mat-list>
              </mat-card-content>
              <mat-card-actions *ngIf="avaliacoesDisponiveis.length === 0">
                <p class="no-items">Nenhuma avaliação disponível no momento.</p>
              </mat-card-actions>
            </mat-card>

            <!-- Avaliações em Andamento -->
            <mat-card class="avaliacoes-card" *ngIf="avaliacoesEmAndamento.length > 0">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>schedule</mat-icon>
                  Em Andamento
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-list>
                  <mat-list-item *ngFor="let avaliacao of avaliacoesEmAndamento">
                    <mat-icon matListItemIcon>schedule</mat-icon>
                    <div matListItemTitle>{{ avaliacao.avaliacao?.instrucao || 'Avaliação sem título' }}</div>
                    <div matListItemLine>Iniciada em: {{ formatDate(avaliacao.dataInicio) }}</div>
                    <button mat-icon-button (click)="continuarAvaliacao(avaliacao)" matListItemMeta>
                      <mat-icon>play_arrow</mat-icon>
                    </button>
                  </mat-list-item>
                </mat-list>
              </mat-card-content>
            </mat-card>

            <!-- Avaliações Concluídas -->
            <mat-card class="avaliacoes-card" *ngIf="avaliacoesConcluidas.length > 0">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>check_circle</mat-icon>
                  Concluídas
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-list>
                  <mat-list-item *ngFor="let avaliacao of avaliacoesConcluidas">
                    <mat-icon matListItemIcon>check_circle</mat-icon>
                    <div matListItemTitle>{{ avaliacao.avaliacao?.instrucao || 'Avaliação sem título' }}</div>
                    <div matListItemLine>Concluída em: {{ formatDate(avaliacao.dataFim) }}</div>
                    <button mat-icon-button (click)="verResultado(avaliacao)" matListItemMeta>
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </mat-list-item>
                </mat-list>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Mensagem quando não há avaliações -->
          <mat-card *ngIf="minhasAvaliacoes.length === 0 && !isLoading" class="no-avaliacoes">
            <mat-card-content>
              <div class="no-content">
                <mat-icon>assignment</mat-icon>
                <h3>Nenhuma avaliação encontrada</h3>
                <p>Você ainda não possui avaliações vinculadas ao seu perfil.</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-container>

      <!-- Dashboard para Professores e Administradores -->
      <ng-container *ngIf="isProfessor || isAdmin">
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
      </ng-container>
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

    /* Estilos específicos para alunos */
    .welcome-section {
      margin-bottom: 24px;
    }

    .welcome-card {
      background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
      color: white;
    }

    .welcome-card mat-card-title {
      color: white;
    }

    .welcome-card mat-icon {
      color: white;
    }

    .avaliacoes-section h2 {
      margin: 24px 0 16px 0;
      color: #333;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      text-align: center;
      padding: 16px;
    }

    .stat-card.disponivel {
      border-left: 4px solid #4caf50;
    }

    .stat-card.concluida {
      border-left: 4px solid #2196f3;
    }

    .stat-card.em-andamento {
      border-left: 4px solid #ff9800;
    }

    .stat-number {
      font-size: 2em;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .stat-card.disponivel .stat-number {
      color: #4caf50;
    }

    .stat-card.concluida .stat-number {
      color: #2196f3;
    }

    .stat-card.em-andamento .stat-number {
      color: #ff9800;
    }

    .stat-label {
      color: #666;
      font-size: 0.9em;
    }

    .avaliacoes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .avaliacoes-card {
      height: fit-content;
    }

    .no-avaliacoes {
      margin-top: 24px;
    }

    .no-content {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-content mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-content h3 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .no-items {
      text-align: center;
      color: #666;
      font-style: italic;
      margin: 16px 0;
    }

    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      }

      .avaliacoes-grid {
        grid-template-columns: 1fr;
      }
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

  // Propriedades para alunos
  minhasAvaliacoes: ParticipanteAvaliacao[] = [];
  avaliacoesDisponiveis: ParticipanteAvaliacao[] = [];
  avaliacoesEmAndamento: ParticipanteAvaliacao[] = [];
  avaliacoesConcluidas: ParticipanteAvaliacao[] = [];

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

  constructor(
    private relatorioService: RelatorioService,
    private aplicacaoService: AplicacaoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateGridCols();

    if (this.isAluno) {
      this.loadMinhasAvaliacoes();
    } else {
      this.loadDashboardData();
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.relatorioService.getDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.totalUsuarios = data.resumo_geral.total_usuarios;
        this.totalAvaliacoes = data.resumo_geral.total_avaliacoes;
        this.totalQuestoes = data.resumo_geral.total_questoes;
        this.totalAplicacoes = data.resumo_geral.total_participacoes;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.log('📊 Dashboard error:', error);

        // Usar dados de fallback para demonstração
        this.totalUsuarios = 125;
        this.totalAvaliacoes = 23;
        this.totalQuestoes = 456;
        this.totalAplicacoes = 12;

        const errorMessage = extractErrorMessage(error);
        console.log('🎯 Dashboard error message:', errorMessage);
      }
    });
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

  // Getters para roles
  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  get isProfessor(): boolean {
    return this.authService.isProfessor;
  }

  get isAluno(): boolean {
    return this.authService.isAluno;
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  // Métodos para alunos
  loadMinhasAvaliacoes(): void {
    this.isLoading = true;
    this.aplicacaoService.getAplicacoes().subscribe({
      next: (response) => {
        this.minhasAvaliacoes = response.data || [];
        this.categorizeAvaliacoes();
        this.isLoading = false;
      },
      error: (error) => {
        console.log('📊 Erro ao carregar avaliações do aluno:', error);
        this.isLoading = false;

        // Dados de fallback para demonstração
        this.createMockAvaliacoes();
      }
    });
  }

  private categorizeAvaliacoes(): void {
    this.avaliacoesDisponiveis = this.minhasAvaliacoes.filter(a =>
      a.disponivel && !a.dataInicio && !a.dataFim
    );

    this.avaliacoesEmAndamento = this.minhasAvaliacoes.filter(a =>
      a.dataInicio && !a.dataFim
    );

    this.avaliacoesConcluidas = this.minhasAvaliacoes.filter(a =>
      a.dataFim
    );
  }

  private createMockAvaliacoes(): void {
    this.minhasAvaliacoes = [
      {
        id: 1,
        avaliacaoId: 1,
        avaliacao: {
          id: 1,
          instrucao: 'Avaliação de Matemática - 1º Bimestre',
          disciplina: { id: 1, descricao: 'Matemática', codigo: 'MAT' }
        },
        usuarioId: 1,
        disponivel: true,
        statusAplicacaoId: 1,
        avaliado: false
      } as ParticipanteAvaliacao,
      {
        id: 2,
        avaliacaoId: 2,
        avaliacao: {
          id: 2,
          instrucao: 'Prova de Português - Redação',
          disciplina: { id: 2, descricao: 'Português', codigo: 'POR' }
        },
        usuarioId: 1,
        disponivel: true,
        dataInicio: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        statusAplicacaoId: 2,
        avaliado: false
      } as ParticipanteAvaliacao,
      {
        id: 3,
        avaliacaoId: 3,
        avaliacao: {
          id: 3,
          instrucao: 'Teste de Ciências - Capítulos 1-3',
          disciplina: { id: 3, descricao: 'Ciências', codigo: 'CIE' }
        },
        usuarioId: 1,
        disponivel: false,
        dataInicio: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
        dataFim: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 horas atrás
        statusAplicacaoId: 3,
        avaliado: true
      } as ParticipanteAvaliacao
    ];

    this.categorizeAvaliacoes();
  }

  iniciarAvaliacao(avaliacao: ParticipanteAvaliacao): void {
    if (avaliacao.id) {
      console.log('🎯 Iniciando avaliação:', avaliacao.avaliacao?.instrucao);
      this.router.navigate(['/aplicacoes', avaliacao.id, 'aplicar']);
    }
  }

  continuarAvaliacao(avaliacao: ParticipanteAvaliacao): void {
    if (avaliacao.id) {
      console.log('🔄 Continuando avaliação:', avaliacao.avaliacao?.instrucao);
      this.router.navigate(['/aplicacoes', avaliacao.id, 'aplicar']);
    }
  }

  verResultado(avaliacao: ParticipanteAvaliacao): void {
    if (avaliacao.id) {
      console.log('📈 Visualizando resultado:', avaliacao.avaliacao?.instrucao);
      // Para visualizar resultado, vamos para a página de aplicações primeiro
      this.router.navigate(['/aplicacoes']);
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Data não informada';

    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

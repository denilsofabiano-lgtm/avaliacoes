import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  template: `
    <div class="relatorios-container">
      <div class="header-section">
        <h1>Relatórios e Análises</h1>
      </div>

      <!-- Cards de Resumo -->
      <div class="resumo-cards">
        <mat-card class="resumo-card">
          <mat-card-content>
            <div class="resumo-item">
              <mat-icon>assignment</mat-icon>
              <div class="resumo-content">
                <div class="resumo-numero">{{ resumoGeral.totalAvaliacoes }}</div>
                <div class="resumo-label">Avaliações Criadas</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="resumo-card">
          <mat-card-content>
            <div class="resumo-item">
              <mat-icon>people</mat-icon>
              <div class="resumo-content">
                <div class="resumo-numero">{{ resumoGeral.totalParticipacoes }}</div>
                <div class="resumo-label">Participações</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="resumo-card">
          <mat-card-content>
            <div class="resumo-item">
              <mat-icon>check_circle</mat-icon>
              <div class="resumo-content">
                <div class="resumo-numero">{{ resumoGeral.provasFinalizadas }}</div>
                <div class="resumo-label">Provas Finalizadas</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="resumo-card">
          <mat-card-content>
            <div class="resumo-item">
              <mat-icon>trending_up</mat-icon>
              <div class="resumo-content">
                <div class="resumo-numero">{{ resumoGeral.mediaGeral }}%</div>
                <div class="resumo-label">Média Geral</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card>
        <mat-tab-group>
          <mat-tab label="Desempenho por Avaliação">
            <div class="tab-content">
              <div class="filtros-section">
                <form [formGroup]="filtrosForm" class="filtros-form">
                  <mat-form-field>
                    <mat-label>Período</mat-label>
                    <mat-select formControlName="periodo">
                      <mat-option value="7">Últimos 7 dias</mat-option>
                      <mat-option value="30">Últimos 30 dias</mat-option>
                      <mat-option value="90">Últimos 3 meses</mat-option>
                      <mat-option value="365">Último ano</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Tipo de Avaliação</mat-label>
                    <mat-select formControlName="tipoAvaliacao">
                      <mat-option value="">Todos os tipos</mat-option>
                      <mat-option value="Diagnóstica">Diagnóstica</mat-option>
                      <mat-option value="Processual">Processual</mat-option>
                      <mat-option value="Final de Ciclo">Final de Ciclo</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <button mat-raised-button color="primary" (click)="aplicarFiltros()">
                    <mat-icon>filter_list</mat-icon>
                    Aplicar Filtros
                  </button>
                </form>
              </div>

              <table mat-table [dataSource]="relatorioAvaliacoes" class="relatorio-table">
                <ng-container matColumnDef="avaliacao">
                  <th mat-header-cell *matHeaderCellDef>Avaliação</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="avaliacao-info">
                      <div class="avaliacao-nome">{{ item.nomeAvaliacao }}</div>
                      <div class="avaliacao-tipo">{{ item.tipoAvaliacao }}</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="participantes">
                  <th mat-header-cell *matHeaderCellDef>Participantes</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="participantes-info">
                      <div class="participantes-numero">{{ item.totalParticipantes }}</div>
                      <div class="participantes-finalizados">{{ item.finalizados }} finalizaram</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="media">
                  <th mat-header-cell *matHeaderCellDef>Média</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="media-info">
                      <div class="media-numero" [class]="getMediaClass(item.mediaPercentual)">
                        {{ item.mediaPercentual }}%
                      </div>
                      <mat-progress-bar 
                        [value]="item.mediaPercentual" 
                        [color]="getProgressColor(item.mediaPercentual)">
                      </mat-progress-bar>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="distribuicao">
                  <th mat-header-cell *matHeaderCellDef>Distribuição</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="distribuicao-notas">
                      <mat-chip color="primary">A: {{ item.distribuicao.excelente }}</mat-chip>
                      <mat-chip color="accent">B: {{ item.distribuicao.bom }}</mat-chip>
                      <mat-chip color="warn">C: {{ item.distribuicao.regular }}</mat-chip>
                      <mat-chip>D: {{ item.distribuicao.ruim }}</mat-chip>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Ações</th>
                  <td mat-cell *matCellDef="let item">
                    <button mat-icon-button (click)="verDetalhes(item)">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button (click)="exportarRelatorio(item)">
                      <mat-icon>download</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['avaliacao', 'participantes', 'media', 'distribuicao', 'actions']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['avaliacao', 'participantes', 'media', 'distribuicao', 'actions'];"></tr>
              </table>
            </div>
          </mat-tab>

          <mat-tab label="Desempenho por Aluno">
            <div class="tab-content">
              <div class="filtros-section">
                <form [formGroup]="filtrosAlunoForm" class="filtros-form">
                  <mat-form-field>
                    <mat-label>Buscar Aluno</mat-label>
                    <input matInput formControlName="nomeAluno" placeholder="Digite o nome do aluno">
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Turma</mat-label>
                    <mat-select formControlName="turma">
                      <mat-option value="">Todas as turmas</mat-option>
                      <mat-option value="7A">7A</mat-option>
                      <mat-option value="7B">7B</mat-option>
                      <mat-option value="8A">8A</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Escola</mat-label>
                    <mat-select formControlName="escola">
                      <mat-option value="">Todas as escolas</mat-option>
                      <mat-option value="Escola Municipal Santos">Escola Municipal Santos</mat-option>
                      <mat-option value="Colégio Estadual Silva">Colégio Estadual Silva</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <button mat-raised-button color="primary" (click)="aplicarFiltrosAluno()">
                    <mat-icon>search</mat-icon>
                    Buscar
                  </button>
                </form>
              </div>

              <table mat-table [dataSource]="relatorioAlunos" class="relatorio-table">
                <ng-container matColumnDef="aluno">
                  <th mat-header-cell *matHeaderCellDef>Aluno</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="aluno-info">
                      <div class="aluno-nome">{{ item.nomeAluno }}</div>
                      <div class="aluno-turma">{{ item.turma }} - {{ item.escola }}</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="avaliacoes">
                  <th mat-header-cell *matHeaderCellDef>Avaliações</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="avaliacoes-info">
                      <div class="avaliacoes-realizadas">{{ item.avaliacoesRealizadas }}</div>
                      <div class="avaliacoes-pendentes">{{ item.avaliacoesPendentes }} pendentes</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="mediaGeral">
                  <th mat-header-cell *matHeaderCellDef>Média Geral</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="media-aluno">
                      <div class="media-numero" [class]="getMediaClass(item.mediaGeral)">
                        {{ item.mediaGeral }}%
                      </div>
                      <mat-progress-bar 
                        [value]="item.mediaGeral" 
                        [color]="getProgressColor(item.mediaGeral)"
                        class="media-progress">
                      </mat-progress-bar>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="ultimaAvaliacao">
                  <th mat-header-cell *matHeaderCellDef>Última Avaliação</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="ultima-avaliacao">
                      <div class="avaliacao-nome">{{ item.ultimaAvaliacao.nome }}</div>
                      <div class="avaliacao-nota">Nota: {{ item.ultimaAvaliacao.nota }}%</div>
                      <div class="avaliacao-data">{{ item.ultimaAvaliacao.data | date:'dd/MM/yyyy' }}</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Ações</th>
                  <td mat-cell *matCellDef="let item">
                    <button mat-icon-button (click)="verPerfilAluno(item)">
                      <mat-icon>person</mat-icon>
                    </button>
                    <button mat-icon-button (click)="exportarPerfilAluno(item)">
                      <mat-icon>download</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['aluno', 'avaliacoes', 'mediaGeral', 'ultimaAvaliacao', 'actions']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['aluno', 'avaliacoes', 'mediaGeral', 'ultimaAvaliacao', 'actions'];"></tr>
              </table>
            </div>
          </mat-tab>

          <mat-tab label="Análise de Questões">
            <div class="tab-content">
              <div class="filtros-section">
                <h3>Questões com Maior Índice de Erro</h3>
                <p>Identifique questões que podem precisar de revisão</p>
              </div>

              <table mat-table [dataSource]="analiseQuestoes" class="relatorio-table">
                <ng-container matColumnDef="questao">
                  <th mat-header-cell *matHeaderCellDef>Questão</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="questao-info">
                      <div class="questao-id">ID: {{ item.questaoId }}</div>
                      <div class="questao-texto">{{ item.questaoTexto }}</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="disciplina">
                  <th mat-header-cell *matHeaderCellDef>Disciplina</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-chip color="primary">{{ item.disciplina }}</mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="indiceAcerto">
                  <th mat-header-cell *matHeaderCellDef>Índice de Acerto</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="indice-acerto">
                      <div class="indice-numero" [class]="getIndiceClass(item.indiceAcerto)">
                        {{ item.indiceAcerto }}%
                      </div>
                      <mat-progress-bar 
                        [value]="item.indiceAcerto" 
                        [color]="getProgressColor(item.indiceAcerto)">
                      </mat-progress-bar>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="totalRespostas">
                  <th mat-header-cell *matHeaderCellDef>Respostas</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="total-respostas">
                      <div>{{ item.respostasCorretas }} / {{ item.totalRespostas }}</div>
                      <div class="respostas-label">corretas</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="acoes">
                  <th mat-header-cell *matHeaderCellDef>Ações</th>
                  <td mat-cell *matCellDef="let item">
                    <button mat-icon-button (click)="analisarQuestao(item)">
                      <mat-icon>analytics</mat-icon>
                    </button>
                    <button mat-icon-button (click)="reportarProblema(item)">
                      <mat-icon>report_problem</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['questao', 'disciplina', 'indiceAcerto', 'totalRespostas', 'acoes']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['questao', 'disciplina', 'indiceAcerto', 'totalRespostas', 'acoes'];"></tr>
              </table>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .relatorios-container {
      padding: 20px;
    }

    .header-section {
      margin-bottom: 20px;
    }

    .resumo-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .resumo-card {
      text-align: center;
    }

    .resumo-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .resumo-item mat-icon {
      font-size: 2em;
      width: 2em;
      height: 2em;
      color: #1976d2;
    }

    .resumo-content {
      flex: 1;
      text-align: left;
    }

    .resumo-numero {
      font-size: 2em;
      font-weight: bold;
      color: #1976d2;
    }

    .resumo-label {
      color: #666;
      margin-top: 4px;
    }

    .tab-content {
      padding: 20px;
    }

    .filtros-section {
      margin-bottom: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .filtros-form {
      display: flex;
      gap: 16px;
      align-items: end;
      flex-wrap: wrap;
    }

    .filtros-form mat-form-field {
      min-width: 200px;
    }

    .relatorio-table {
      width: 100%;
    }

    .avaliacao-info,
    .aluno-info {
      display: flex;
      flex-direction: column;
    }

    .avaliacao-nome,
    .aluno-nome {
      font-weight: 500;
    }

    .avaliacao-tipo,
    .aluno-turma {
      font-size: 0.9em;
      color: #666;
    }

    .participantes-info,
    .avaliacoes-info {
      text-align: center;
    }

    .participantes-numero,
      .avaliacoes-realizadas {
      font-weight: bold;
      font-size: 1.2em;
    }

    .participantes-finalizados,
    .avaliacoes-pendentes {
      font-size: 0.9em;
      color: #666;
    }

    .media-info,
    .media-aluno {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .media-numero {
      font-weight: bold;
      text-align: center;
    }

    .media-numero.excelente {
      color: #4caf50;
    }

    .media-numero.bom {
      color: #2196f3;
    }

    .media-numero.regular {
      color: #ff9800;
    }

    .media-numero.ruim {
      color: #f44336;
    }

    .distribuicao-notas {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .ultima-avaliacao {
      display: flex;
      flex-direction: column;
      font-size: 0.9em;
    }

    .avaliacao-nota {
      font-weight: bold;
      color: #1976d2;
    }

    .avaliacao-data {
      color: #666;
    }

    .questao-info {
      display: flex;
      flex-direction: column;
    }

    .questao-id {
      font-size: 0.8em;
      color: #666;
    }

    .questao-texto {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .indice-acerto {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .indice-numero {
      font-weight: bold;
      text-align: center;
    }

    .indice-numero.excelente {
      color: #4caf50;
    }

    .indice-numero.bom {
      color: #2196f3;
    }

    .indice-numero.regular {
      color: #ff9800;
    }

    .indice-numero.ruim {
      color: #f44336;
    }

    .total-respostas {
      text-align: center;
    }

    .respostas-label {
      font-size: 0.8em;
      color: #666;
    }

    .media-progress {
      width: 100px;
    }

    .mat-column-actions,
    .mat-column-acoes {
      width: 100px;
      text-align: center;
    }

    @media (max-width: 768px) {
      .relatorios-container {
        padding: 16px;
      }

      .resumo-cards {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .filtros-form {
        flex-direction: column;
      }

      .filtros-form mat-form-field {
        width: 100%;
        min-width: unset;
      }

      .relatorio-table {
        font-size: 14px;
      }

      .mat-column-distribuicao,
      .mat-column-ultimaAvaliacao {
        display: none;
      }

      .questao-texto {
        max-width: 150px;
      }
    }

    @media (max-width: 480px) {
      .resumo-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RelatoriosComponent implements OnInit {
  filtrosForm: FormGroup;
  filtrosAlunoForm: FormGroup;

  resumoGeral = {
    totalAvaliacoes: 25,
    totalParticipacoes: 340,
    provasFinalizadas: 285,
    mediaGeral: 76
  };

  relatorioAvaliacoes = [
    {
      nomeAvaliacao: 'Avaliação Diagnóstica de Matemática',
      tipoAvaliacao: 'Diagnóstica',
      totalParticipantes: 45,
      finalizados: 42,
      mediaPercentual: 78,
      distribuicao: { excelente: 12, bom: 18, regular: 8, ruim: 4 }
    },
    {
      nomeAvaliacao: 'Prova de Português - 1º Bimestre',
      tipoAvaliacao: 'Processual',
      totalParticipantes: 38,
      finalizados: 35,
      mediaPercentual: 82,
      distribuicao: { excelente: 15, bom: 13, regular: 5, ruim: 2 }
    },
    {
      nomeAvaliacao: 'Avaliação de História - Idade Média',
      tipoAvaliacao: 'Final de Ciclo',
      totalParticipantes: 52,
      finalizados: 48,
      mediaPercentual: 65,
      distribuicao: { excelente: 8, bom: 22, regular: 12, ruim: 6 }
    }
  ];

  relatorioAlunos = [
    {
      nomeAluno: 'João Silva',
      turma: '7A',
      escola: 'Escola Municipal Santos',
      avaliacoesRealizadas: 12,
      avaliacoesPendentes: 3,
      mediaGeral: 85,
      ultimaAvaliacao: {
        nome: 'Prova de Matemática',
        nota: 92,
        data: new Date('2024-01-15')
      }
    },
    {
      nomeAluno: 'Maria Santos',
      turma: '7A',
      escola: 'Escola Municipal Santos',
      avaliacoesRealizadas: 11,
      avaliacoesPendentes: 4,
      mediaGeral: 78,
      ultimaAvaliacao: {
        nome: 'Prova de Português',
        nota: 75,
        data: new Date('2024-01-12')
      }
    },
    {
      nomeAluno: 'Pedro Oliveira',
      turma: '8A',
      escola: 'Colégio Estadual Silva',
      avaliacoesRealizadas: 10,
      avaliacoesPendentes: 2,
      mediaGeral: 72,
      ultimaAvaliacao: {
        nome: 'Prova de História',
        nota: 68,
        data: new Date('2024-01-10')
      }
    }
  ];

  analiseQuestoes = [
    {
      questaoId: 127,
      questaoTexto: 'Resolva a equação: 3x + 2 = 14',
      disciplina: 'Matemática',
      indiceAcerto: 45,
      respostasCorretas: 18,
      totalRespostas: 40
    },
    {
      questaoId: 203,
      questaoTexto: 'Explique o processo de fotossíntese',
      disciplina: 'Ciências',
      indiceAcerto: 52,
      respostasCorretas: 21,
      totalRespostas: 40
    },
    {
      questaoId: 89,
      questaoTexto: 'Identifique a figura de linguagem na frase...',
      disciplina: 'Português',
      indiceAcerto: 38,
      respostasCorretas: 15,
      totalRespostas: 40
    }
  ];

  constructor(private fb: FormBuilder) {
    this.filtrosForm = this.fb.group({
      periodo: ['30'],
      tipoAvaliacao: ['']
    });

    this.filtrosAlunoForm = this.fb.group({
      nomeAluno: [''],
      turma: [''],
      escola: ['']
    });
  }

  ngOnInit(): void {}

  aplicarFiltros(): void {
    console.log('Aplicar filtros:', this.filtrosForm.value);
  }

  aplicarFiltrosAluno(): void {
    console.log('Aplicar filtros aluno:', this.filtrosAlunoForm.value);
  }

  verDetalhes(item: any): void {
    console.log('Ver detalhes:', item);
  }

  exportarRelatorio(item: any): void {
    console.log('Exportar relatório:', item);
  }

  verPerfilAluno(item: any): void {
    console.log('Ver perfil do aluno:', item);
  }

  exportarPerfilAluno(item: any): void {
    console.log('Exportar perfil do aluno:', item);
  }

  analisarQuestao(item: any): void {
    console.log('Analisar questão:', item);
  }

  reportarProblema(item: any): void {
    console.log('Reportar problema na questão:', item);
  }

  getMediaClass(media: number): string {
    if (media >= 80) return 'excelente';
    if (media >= 70) return 'bom';
    if (media >= 60) return 'regular';
    return 'ruim';
  }

  getProgressColor(valor: number): 'primary' | 'accent' | 'warn' {
    if (valor >= 70) return 'primary';
    if (valor >= 60) return 'accent';
    return 'warn';
  }

  getIndiceClass(indice: number): string {
    if (indice >= 80) return 'excelente';
    if (indice >= 70) return 'bom';
    if (indice >= 60) return 'regular';
    return 'ruim';
  }
}

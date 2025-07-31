import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TipoAvaliacaoEnum, StatusAvaliacaoEnum } from '../../../models';

@Component({
  selector: 'app-avaliacao-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTableModule,
    MatCheckboxModule
  ],
  template: `
    <div class="form-container">
      <div class="header-section">
        <h1>{{ isEditing ? 'Editar' : 'Nova' }} Avaliação</h1>
        <button mat-button routerLink="/avaliacoes">
          <mat-icon>arrow_back</mat-icon>
          Voltar
        </button>
      </div>

      <mat-card>
        <mat-tab-group>
          <mat-tab label="Dados Básicos">
            <div class="tab-content">
              <form [formGroup]="avaliacaoForm" (ngSubmit)="onSubmit()">
                <div class="form-row">
                  <mat-form-field class="full-width">
                    <mat-label>Tipo de Avaliação</mat-label>
                    <mat-select formControlName="tipoAvaliacaoId" required>
                      <mat-option *ngFor="let tipo of tiposAvaliacao" [value]="tipo.id">
                        {{ tipo.descricao }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="avaliacaoForm.get('tipoAvaliacaoId')?.hasError('required')">
                      Tipo de avaliação é obrigatório
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field class="full-width">
                    <mat-label>Instruções</mat-label>
                    <textarea 
                      matInput 
                      formControlName="instrucao" 
                      rows="6"
                      placeholder="Descreva as instruções da avaliação...">
                    </textarea>
                    <mat-hint>Orientações gerais para os participantes</mat-hint>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field class="half-width">
                    <mat-label>Status</mat-label>
                    <mat-select formControlName="statusAvaliacaoId" required>
                      <mat-option [value]="0">Pendente</mat-option>
                      <mat-option [value]="1">Aprovado</mat-option>
                      <mat-option [value]="2">Cancelado</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="form-actions">
                  <button mat-button type="button" routerLink="/avaliacoes">
                    Cancelar
                  </button>
                  <button mat-raised-button 
                          color="primary" 
                          type="submit"
                          [disabled]="avaliacaoForm.invalid || isLoading">
                    <mat-icon *ngIf="isLoading">refresh</mat-icon>
                    {{ isLoading ? 'Salvando...' : 'Salvar' }}
                  </button>
                </div>
              </form>
            </div>
          </mat-tab>

          <mat-tab label="Questões" [disabled]="!avaliacaoId">
            <div class="tab-content">
              <div class="questoes-header">
                <h3>Questões da Avaliação</h3>
                <button mat-raised-button color="primary" (click)="addQuestoes()">
                  <mat-icon>add</mat-icon>
                  Adicionar Questões
                </button>
              </div>

              <table mat-table [dataSource]="questoesSelecionadas" class="questoes-table">
                <ng-container matColumnDef="select">
                  <th mat-header-cell *matHeaderCellDef>
                    <mat-checkbox 
                      (change)="$event ? masterToggle() : null"
                      [checked]="selection.hasValue() && isAllSelected()"
                      [indeterminate]="selection.hasValue() && !isAllSelected()">
                    </mat-checkbox>
                  </th>
                  <td mat-cell *matCellDef="let questao">
                    <mat-checkbox 
                      (click)="$event.stopPropagation()"
                      (change)="$event ? selection.toggle(questao) : null"
                      [checked]="selection.isSelected(questao)">
                    </mat-checkbox>
                  </td>
                </ng-container>

                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef>ID</th>
                  <td mat-cell *matCellDef="let questao">{{ questao.id }}</td>
                </ng-container>

                <ng-container matColumnDef="pergunta">
                  <th mat-header-cell *matHeaderCellDef>Pergunta</th>
                  <td mat-cell *matCellDef="let questao">
                    <div class="pergunta-cell">{{ questao.pergunta }}</div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="disciplina">
                  <th mat-header-cell *matHeaderCellDef>Disciplina</th>
                  <td mat-cell *matCellDef="let questao">{{ questao.disciplina?.descricao || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="pontuacao">
                  <th mat-header-cell *matHeaderCellDef>Pontuação</th>
                  <td mat-cell *matCellDef="let questao">{{ questao.pontuacao || 0 }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Ações</th>
                  <td mat-cell *matCellDef="let questao">
                    <button mat-icon-button (click)="removeQuestao(questao)">
                      <mat-icon color="warn">delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="questoesColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: questoesColumns;"></tr>
              </table>

              <div class="questoes-actions" *ngIf="selection.hasValue()">
                <button mat-button color="warn" (click)="removeQuestoesSelecionadas()">
                  <mat-icon>delete</mat-icon>
                  Remover Selecionadas ({{ selection.selected.length }})
                </button>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container {
      padding: 20px;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .tab-content {
      padding: 20px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      width: 48%;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 24px;
      border-top: 1px solid #eee;
      padding-top: 16px;
    }

    .questoes-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .questoes-table {
      width: 100%;
      margin-bottom: 20px;
    }

    .pergunta-cell {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .questoes-actions {
      padding: 16px;
      background: #f5f5f5;
      border-radius: 4px;
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
      width: 100px;
    }
  `]
})
export class AvaliacaoFormComponent implements OnInit {
  avaliacaoForm: FormGroup;
  isEditing = false;
  isLoading = false;
  avaliacaoId: number | null = null;

  questoesColumns: string[] = ['select', 'id', 'pergunta', 'disciplina', 'pontuacao', 'actions'];
  questoesSelecionadas: any[] = [];
  selection = { hasValue: () => false, isSelected: () => false, toggle: () => {}, selected: [] };

  tiposAvaliacao = [
    { id: 1, descricao: TipoAvaliacaoEnum.DIAGNOSTICA },
    { id: 2, descricao: TipoAvaliacaoEnum.PROCESSUAL },
    { id: 3, descricao: TipoAvaliacaoEnum.FINAL_CICLO },
    { id: 4, descricao: TipoAvaliacaoEnum.CERTIFICADORA }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.avaliacaoForm = this.fb.group({
      tipoAvaliacaoId: ['', Validators.required],
      instrucao: [''],
      statusAvaliacaoId: [StatusAvaliacaoEnum.PENDENTE, Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.avaliacaoId = +params['id'];
        this.isEditing = true;
        this.loadAvaliacao();
      }
    });
  }

  loadAvaliacao(): void {
    // Simular carregamento
    this.avaliacaoForm.patchValue({
      tipoAvaliacaoId: 1,
      instrucao: 'Avaliação de exemplo carregada',
      statusAvaliacaoId: StatusAvaliacaoEnum.PENDENTE
    });

    // Simular questões
    this.questoesSelecionadas = [
      {
        id: 1,
        pergunta: 'Qual é a capital do Brasil?',
        disciplina: { descricao: 'Geografia' },
        pontuacao: 2
      },
      {
        id: 2,
        pergunta: 'Resolva a equação: 2x + 5 = 15',
        disciplina: { descricao: 'Matemática' },
        pontuacao: 3
      }
    ];
  }

  onSubmit(): void {
    if (this.avaliacaoForm.valid) {
      this.isLoading = true;
      
      setTimeout(() => {
        this.isLoading = false;
        this.snackBar.open(
          this.isEditing ? 'Avaliação atualizada!' : 'Avaliação criada!', 
          'Fechar', 
          { duration: 3000 }
        );
        this.router.navigate(['/avaliacoes']);
      }, 1500);
    }
  }

  addQuestoes(): void {
    console.log('Abrir modal para adicionar quest��es');
  }

  removeQuestao(questao: any): void {
    const index = this.questoesSelecionadas.indexOf(questao);
    if (index > -1) {
      this.questoesSelecionadas.splice(index, 1);
    }
  }

  removeQuestoesSelecionadas(): void {
    console.log('Remover questões selecionadas');
  }

  masterToggle(): void {
    console.log('Toggle all');
  }

  isAllSelected(): boolean {
    return false;
  }
}

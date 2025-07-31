import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TipoAvaliacaoEnum, StatusAvaliacaoEnum } from '../../../models';

@Component({
  selector: 'app-avaliacao-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
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
        <mat-card-content>
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
        </mat-card-content>
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
  `]
})
export class AvaliacaoFormComponent implements OnInit {
  avaliacaoForm: FormGroup;
  isEditing = false;
  isLoading = false;
  avaliacaoId: number | null = null;

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
}

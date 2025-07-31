import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { TipoAlternativaEnum, NivelDificuldadeEnum } from '../../../models';

@Component({
  selector: 'app-questao-form',
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
    MatSnackBarModule,
    MatTabsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatExpansionModule
  ],
  template: `
    <div class="form-container">
      <div class="header-section">
        <h1>{{ isEditing ? 'Editar' : 'Nova' }} Questão</h1>
        <button mat-button routerLink="/questoes">
          <mat-icon>arrow_back</mat-icon>
          Voltar
        </button>
      </div>

      <form [formGroup]="questaoForm" (ngSubmit)="onSubmit()">
        <mat-card>
          <mat-tab-group>
            <mat-tab label="Dados Básicos">
              <div class="tab-content">
                <div class="form-row">
                  <mat-form-field class="half-width">
                    <mat-label>Disciplina</mat-label>
                    <mat-select formControlName="disciplinaId">
                      <mat-option value="">Selecione uma disciplina</mat-option>
                      <mat-option *ngFor="let disciplina of disciplinas" [value]="disciplina.id">
                        {{ disciplina.descricao }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field class="half-width">
                    <mat-label>Tipo de Alternativa</mat-label>
                    <mat-select formControlName="tipoAlternativaId" required (selectionChange)="onTipoAlternativaChange($event.value)">
                      <mat-option *ngFor="let tipo of tiposAlternativa" [value]="tipo.id">
                        {{ tipo.descricao }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field class="half-width">
                    <mat-label>Nível de Dificuldade</mat-label>
                    <mat-select formControlName="nivelDificuldadeId">
                      <mat-option value="">Selecione o nível</mat-option>
                      <mat-option *ngFor="let nivel of niveisDificuldade" [value]="nivel.id">
                        {{ nivel.descricao }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field class="half-width">
                    <mat-label>Pontuação</mat-label>
                    <input matInput type="number" formControlName="pontuacao" min="0" step="0.5">
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field class="full-width">
                    <mat-label>Pergunta</mat-label>
                    <textarea 
                      matInput 
                      formControlName="pergunta" 
                      rows="4"
                      placeholder="Digite a pergunta da questão..."
                      required>
                    </textarea>
                    <mat-error *ngIf="questaoForm.get('pergunta')?.hasError('required')">
                      Pergunta é obrigatória
                    </mat-error>
                  </mat-form-field>
                </div>

                <mat-expansion-panel class="contexto-panel" *ngIf="showContexto">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon>article</mat-icon>
                      Texto de Contexto
                    </mat-panel-title>
                  </mat-expansion-panel-header>
                  
                  <div class="contexto-content">
                    <mat-form-field class="full-width">
                      <mat-label>Contexto da Questão</mat-label>
                      <textarea 
                        matInput 
                        formControlName="contexto" 
                        rows="6"
                        placeholder="Digite o texto de contexto para a questão...">
                      </textarea>
                      <mat-hint>Texto base que será usado para uma ou mais questões</mat-hint>
                    </mat-form-field>
                  </div>
                </mat-expansion-panel>
              </div>
            </mat-tab>

            <mat-tab label="Alternativas" *ngIf="isMultiplaEscolha">
              <div class="tab-content">
                <div class="alternativas-header">
                  <h3>Alternativas da Questão</h3>
                  <button mat-button type="button" (click)="addAlternativa()">
                    <mat-icon>add</mat-icon>
                    Adicionar Alternativa
                  </button>
                </div>

                <div formArrayName="alternativas" class="alternativas-list">
                  <mat-card 
                    *ngFor="let alternativa of alternativas.controls; let i = index" 
                    class="alternativa-card"
                    [formGroupName]="i">
                    
                    <div class="alternativa-header">
                      <div class="alternativa-letra">
                        <strong>{{ getLetraAlternativa(i) }}</strong>
                      </div>
                      <div class="alternativa-actions">
                        <mat-radio-button 
                          [value]="i" 
                          [checked]="isAlternativaCorreta(i)"
                          (change)="setAlternativaCorreta(i)"
                          color="primary">
                          Correta
                        </mat-radio-button>
                        <button mat-icon-button 
                                type="button" 
                                (click)="removeAlternativa(i)"
                                [disabled]="alternativas.length <= 2">
                          <mat-icon color="warn">delete</mat-icon>
                        </button>
                      </div>
                    </div>

                    <mat-form-field class="full-width">
                      <mat-label>Conteúdo da Alternativa</mat-label>
                      <textarea 
                        matInput 
                        formControlName="conteudo" 
                        rows="3"
                        placeholder="Digite o conteúdo da alternativa..."
                        required>
                      </textarea>
                      <mat-error *ngIf="alternativa.get('conteudo')?.hasError('required')">
                        Conteúdo é obrigatório
                      </mat-error>
                    </mat-form-field>
                  </mat-card>
                </div>

                <div class="alternativas-info" *ngIf="!hasAlternativaCorreta()">
                  <mat-icon color="warn">warning</mat-icon>
                  Selecione qual alternativa é a correta
                </div>
              </div>
            </mat-tab>

            <mat-tab label="Resposta" *ngIf="isDissertativa">
              <div class="tab-content">
                <mat-form-field class="full-width">
                  <mat-label>Resposta Esperada</mat-label>
                  <textarea 
                    matInput 
                    formControlName="respostaCorreta" 
                    rows="6"
                    placeholder="Digite a resposta esperada para esta questão dissertativa...">
                  </textarea>
                  <mat-hint>Esta resposta servirá como gabarito para correção</mat-hint>
                </mat-form-field>
              </div>
            </mat-tab>

            <mat-tab label="Classificação">
              <div class="tab-content">
                <div class="form-row">
                  <mat-form-field class="half-width">
                    <mat-label>Ciclo</mat-label>
                    <mat-select formControlName="ciclo">
                      <mat-option value="">Selecione o ciclo</mat-option>
                      <mat-option value="Fundamental I">Fundamental I</mat-option>
                      <mat-option value="Fundamental II">Fundamental II</mat-option>
                      <mat-option value="Médio">Médio</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field class="half-width">
                    <mat-label>Fase</mat-label>
                    <mat-select formControlName="fase">
                      <mat-option value="">Selecione a fase</mat-option>
                      <mat-option value="1º Ano">1º Ano</mat-option>
                      <mat-option value="2º Ano">2º Ano</mat-option>
                      <mat-option value="3º Ano">3º Ano</mat-option>
                      <mat-option value="4º Ano">4º Ano</mat-option>
                      <mat-option value="5º Ano">5º Ano</mat-option>
                      <mat-option value="6º Ano">6º Ano</mat-option>
                      <mat-option value="7º Ano">7º Ano</mat-option>
                      <mat-option value="8º Ano">8º Ano</mat-option>
                      <mat-option value="9º Ano">9º Ano</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field class="full-width">
                    <mat-label>Tema</mat-label>
                    <input matInput formControlName="tema" placeholder="Ex: Geometria, Interpretação de Texto, etc.">
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field class="full-width">
                    <mat-label>Habilidades</mat-label>
                    <textarea 
                      matInput 
                      formControlName="habilidades" 
                      rows="3"
                      placeholder="Descreva as habilidades que esta questão avalia...">
                    </textarea>
                  </mat-form-field>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>

          <div class="form-actions">
            <button mat-button type="button" routerLink="/questoes">
              Cancelar
            </button>
            <button mat-button type="button" (click)="previewQuestao()">
              <mat-icon>visibility</mat-icon>
              Visualizar
            </button>
            <button mat-raised-button 
                    color="primary" 
                    type="submit"
                    [disabled]="questaoForm.invalid || isLoading">
              <mat-icon *ngIf="isLoading">refresh</mat-icon>
              {{ isLoading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </mat-card>
      </form>
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

    .contexto-panel {
      margin-bottom: 16px;
    }

    .contexto-content {
      padding: 16px 0;
    }

    .alternativas-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .alternativas-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .alternativa-card {
      padding: 16px;
    }

    .alternativa-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .alternativa-letra {
      background: #1976d2;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    .alternativa-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .alternativas-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: #fff3cd;
      border-radius: 4px;
      margin-top: 16px;
      color: #856404;
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
export class QuestaoFormComponent implements OnInit {
  questaoForm: FormGroup;
  isEditing = false;
  isLoading = false;
  questaoId: number | null = null;

  disciplinas = [
    { id: 1, descricao: 'Matemática' },
    { id: 2, descricao: 'Português' },
    { id: 3, descricao: 'História' },
    { id: 4, descricao: 'Geografia' },
    { id: 5, descricao: 'Ciências' }
  ];

  tiposAlternativa = [
    { id: 1, descricao: TipoAlternativaEnum.DISSERTATIVA },
    { id: 2, descricao: TipoAlternativaEnum.MULTIPLA_ESCOLHA },
    { id: 3, descricao: TipoAlternativaEnum.TEXTO_REFERENCIA }
  ];

  niveisDificuldade = [
    { id: 1, descricao: NivelDificuldadeEnum.FACIL },
    { id: 2, descricao: NivelDificuldadeEnum.MEDIO },
    { id: 3, descricao: NivelDificuldadeEnum.DIFICIL }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.questaoForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.questaoId = +params['id'];
        this.isEditing = true;
        this.loadQuestao();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      disciplinaId: [''],
      tipoAlternativaId: ['', Validators.required],
      nivelDificuldadeId: [''],
      pontuacao: [''],
      pergunta: ['', Validators.required],
      contexto: [''],
      respostaCorreta: [''],
      ciclo: [''],
      fase: [''],
      tema: [''],
      habilidades: [''],
      alternativas: this.fb.array([])
    });
  }

  get alternativas(): FormArray {
    return this.questaoForm.get('alternativas') as FormArray;
  }

  get isMultiplaEscolha(): boolean {
    const tipoId = this.questaoForm.get('tipoAlternativaId')?.value;
    return tipoId === 2; // Múltipla Escolha
  }

  get isDissertativa(): boolean {
    const tipoId = this.questaoForm.get('tipoAlternativaId')?.value;
    return tipoId === 1; // Dissertativa
  }

  get showContexto(): boolean {
    const tipoId = this.questaoForm.get('tipoAlternativaId')?.value;
    return tipoId === 3; // Texto de Referência
  }

  onTipoAlternativaChange(tipoId: number): void {
    // Limpar alternativas quando mudar o tipo
    this.alternativas.clear();
    
    if (tipoId === 2) { // Múltipla Escolha
      // Adicionar 4 alternativas padrão
      for (let i = 0; i < 4; i++) {
        this.addAlternativa();
      }
    }
  }

  createAlternativaGroup(): FormGroup {
    return this.fb.group({
      alternativa: [''],
      conteudo: ['', Validators.required],
      correta: [false]
    });
  }

  addAlternativa(): void {
    const alternativaGroup = this.createAlternativaGroup();
    const letra = this.getLetraAlternativa(this.alternativas.length);
    alternativaGroup.patchValue({ alternativa: letra });
    this.alternativas.push(alternativaGroup);
  }

  removeAlternativa(index: number): void {
    if (this.alternativas.length > 2) {
      this.alternativas.removeAt(index);
      // Reajustar as letras das alternativas
      this.reorderAlternativas();
    }
  }

  reorderAlternativas(): void {
    this.alternativas.controls.forEach((control, index) => {
      control.patchValue({ alternativa: this.getLetraAlternativa(index) });
    });
  }

  getLetraAlternativa(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }

  setAlternativaCorreta(index: number): void {
    // Desmarcar todas as outras
    this.alternativas.controls.forEach((control, i) => {
      control.patchValue({ correta: i === index });
    });
  }

  isAlternativaCorreta(index: number): boolean {
    return this.alternativas.at(index)?.get('correta')?.value || false;
  }

  hasAlternativaCorreta(): boolean {
    return this.alternativas.controls.some(control => control.get('correta')?.value);
  }

  loadQuestao(): void {
    // Simular carregamento
    this.questaoForm.patchValue({
      disciplinaId: 1,
      tipoAlternativaId: 2,
      nivelDificuldadeId: 2,
      pontuacao: 2.5,
      pergunta: 'Questão de exemplo carregada para edição',
      ciclo: 'Fundamental II',
      fase: '7º Ano',
      tema: 'Tema de exemplo'
    });

    // Simular alternativas para múltipla escolha
    this.onTipoAlternativaChange(2);
    this.alternativas.at(0)?.patchValue({ conteudo: 'Alternativa A', correta: true });
    this.alternativas.at(1)?.patchValue({ conteudo: 'Alternativa B', correta: false });
    this.alternativas.at(2)?.patchValue({ conteudo: 'Alternativa C', correta: false });
    this.alternativas.at(3)?.patchValue({ conteudo: 'Alternativa D', correta: false });
  }

  previewQuestao(): void {
    console.log('Preview da questão:', this.questaoForm.value);
  }

  onSubmit(): void {
    if (this.questaoForm.valid) {
      // Validar se questão de múltipla escolha tem alternativa correta
      if (this.isMultiplaEscolha && !this.hasAlternativaCorreta()) {
        this.snackBar.open('Selecione qual alternativa é a correta', 'Fechar', { duration: 3000 });
        return;
      }

      this.isLoading = true;
      
      setTimeout(() => {
        this.isLoading = false;
        this.snackBar.open(
          this.isEditing ? 'Questão atualizada!' : 'Questão criada!', 
          'Fechar', 
          { duration: 3000 }
        );
        this.router.navigate(['/questoes']);
      }, 1500);
    }
  }
}

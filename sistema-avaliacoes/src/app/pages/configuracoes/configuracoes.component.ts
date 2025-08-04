import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-configuracoes',
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
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="configuracoes-container">
      <h1>Configurações do Sistema</h1>

      <mat-card>
        <mat-tab-group>
          <mat-tab label="Tipos de Avaliação">
            <div class="tab-content">
              <div class="section-header">
                <h3>Tipos de Avaliação</h3>
                <button mat-raised-button color="primary" (click)="adicionarTipoAvaliacao()">
                  <mat-icon>add</mat-icon>
                  Novo Tipo
                </button>
              </div>

              <table mat-table [dataSource]="tiposAvaliacao" class="config-table">
                <ng-container matColumnDef="descricao">
                  <th mat-header-cell *matHeaderCellDef>Descrição</th>
                  <td mat-cell *matCellDef="let tipo">{{ tipo.descricao }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let tipo">
                    <mat-slide-toggle [checked]="tipo.status" (change)="toggleStatus(tipo, $event.checked)">
                      {{ tipo.status ? 'Ativo' : 'Inativo' }}
                    </mat-slide-toggle>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Ações</th>
                  <td mat-cell *matCellDef="let tipo">
                    <button mat-icon-button (click)="editarItem(tipo)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="excluirItem(tipo)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['descricao', 'status', 'actions']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['descricao', 'status', 'actions'];"></tr>
              </table>
            </div>
          </mat-tab>

          <mat-tab label="Tipos de Alternativa">
            <div class="tab-content">
              <div class="section-header">
                <h3>Tipos de Alternativa</h3>
                <button mat-raised-button color="primary" (click)="adicionarTipoAlternativa()">
                  <mat-icon>add</mat-icon>
                  Novo Tipo
                </button>
              </div>

              <table mat-table [dataSource]="tiposAlternativa" class="config-table">
                <ng-container matColumnDef="descricao">
                  <th mat-header-cell *matHeaderCellDef>Descrição</th>
                  <td mat-cell *matCellDef="let tipo">{{ tipo.descricao }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let tipo">
                    <mat-slide-toggle [checked]="tipo.status" (change)="toggleStatus(tipo, $event.checked)">
                      {{ tipo.status ? 'Ativo' : 'Inativo' }}
                    </mat-slide-toggle>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Ações</th>
                  <td mat-cell *matCellDef="let tipo">
                    <button mat-icon-button (click)="editarItem(tipo)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="excluirItem(tipo)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['descricao', 'status', 'actions']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['descricao', 'status', 'actions'];"></tr>
              </table>
            </div>
          </mat-tab>

          <mat-tab label="Níveis de Dificuldade">
            <div class="tab-content">
              <div class="section-header">
                <h3>Níveis de Dificuldade</h3>
                <button mat-raised-button color="primary" (click)="adicionarNivelDificuldade()">
                  <mat-icon>add</mat-icon>
                  Novo Nível
                </button>
              </div>

              <table mat-table [dataSource]="niveisDificuldade" class="config-table">
                <ng-container matColumnDef="descricao">
                  <th mat-header-cell *matHeaderCellDef>Descrição</th>
                  <td mat-cell *matCellDef="let nivel">{{ nivel.descricao }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let nivel">
                    <mat-slide-toggle [checked]="nivel.status" (change)="toggleStatus(nivel, $event.checked)">
                      {{ nivel.status ? 'Ativo' : 'Inativo' }}
                    </mat-slide-toggle>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Ações</th>
                  <td mat-cell *matCellDef="let nivel">
                    <button mat-icon-button (click)="editarItem(nivel)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="excluirItem(nivel)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['descricao', 'status', 'actions']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['descricao', 'status', 'actions'];"></tr>
              </table>
            </div>
          </mat-tab>

          <mat-tab label="Disciplinas">
            <div class="tab-content">
              <div class="section-header">
                <h3>Disciplinas</h3>
                <div class="header-actions">
                  <button mat-button (click)="sincronizarDisciplinas()">
                    <mat-icon>sync</mat-icon>
                    Sincronizar com API
                  </button>
                  <button mat-raised-button color="primary" (click)="adicionarDisciplina()">
                    <mat-icon>add</mat-icon>
                    Nova Disciplina
                  </button>
                </div>
              </div>

              <table mat-table [dataSource]="disciplinas" class="config-table">
                <ng-container matColumnDef="descricao">
                  <th mat-header-cell *matHeaderCellDef>Descrição</th>
                  <td mat-cell *matCellDef="let disciplina">{{ disciplina.descricao }}</td>
                </ng-container>

                <ng-container matColumnDef="idExterno">
                  <th mat-header-cell *matHeaderCellDef>ID Externo</th>
                  <td mat-cell *matCellDef="let disciplina">{{ disciplina.idDisciplinaExterno || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let disciplina">
                    <mat-slide-toggle [checked]="disciplina.status" (change)="toggleStatus(disciplina, $event.checked)">
                      {{ disciplina.status ? 'Ativo' : 'Inativo' }}
                    </mat-slide-toggle>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Ações</th>
                  <td mat-cell *matCellDef="let disciplina">
                    <button mat-icon-button (click)="editarItem(disciplina)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="excluirItem(disciplina)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['descricao', 'idExterno', 'status', 'actions']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['descricao', 'idExterno', 'status', 'actions'];"></tr>
              </table>
            </div>
          </mat-tab>

          <mat-tab label="Configurações Gerais">
            <div class="tab-content">
              <form [formGroup]="configForm" (ngSubmit)="salvarConfiguracoes()">
                <h3>Configurações do Sistema</h3>

                <div class="form-row">
                  <mat-form-field class="half-width">
                    <mat-label>Nome do Sistema</mat-label>
                    <input matInput formControlName="nomeSistema">
                  </mat-form-field>

                  <mat-form-field class="half-width">
                    <mat-label>Versão</mat-label>
                    <input matInput formControlName="versao" readonly>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field class="full-width">
                    <mat-label>URL da API Integre</mat-label>
                    <input matInput formControlName="urlApiIntegre" type="url">
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field class="full-width">
                    <mat-label>URL da API Chatvolt</mat-label>
                    <input matInput formControlName="urlApiChatvolt" type="url">
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field class="half-width">
                    <mat-label>Tempo limite para provas (minutos)</mat-label>
                    <input matInput formControlName="tempoLimiteProvas" type="number">
                  </mat-form-field>

                  <mat-form-field class="half-width">
                    <mat-label>Máximo de tentativas</mat-label>
                    <input matInput formControlName="maxTentativas" type="number">
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-slide-toggle formControlName="permitirRascunho">
                    Permitir salvar rascunho durante a prova
                  </mat-slide-toggle>
                </div>

                <div class="form-row">
                  <mat-slide-toggle formControlName="correcaoAutomatica">
                    Correção automática para questões de múltipla escolha
                  </mat-slide-toggle>
                </div>

                <div class="form-row">
                  <mat-slide-toggle formControlName="notificacaoEmail">
                    Enviar notificações por e-mail
                  </mat-slide-toggle>
                </div>

                <div class="form-actions">
                  <button mat-button type="button">Cancelar</button>
                  <button mat-raised-button color="primary" type="submit">
                    <mat-icon>save</mat-icon>
                    Salvar Configurações
                  </button>
                </div>
              </form>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .configuracoes-container {
      padding: 20px;
    }

    .tab-content {
      padding: 20px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .config-table {
      width: 100%;
      margin-bottom: 20px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      align-items: center;
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

    mat-slide-toggle {
      margin-right: 16px;
    }

    .mat-column-actions {
      width: 120px;
      text-align: center;
    }

    .mat-column-status {
      width: 150px;
    }

    .mat-column-idExterno {
      width: 120px;
    }
  `]
})
export class ConfiguracoesComponent implements OnInit {
  configForm: FormGroup;

  tiposAvaliacao = [
    { id: 1, descricao: 'Diagnóstica', status: true },
    { id: 2, descricao: 'Processual', status: true },
    { id: 3, descricao: 'Final de Ciclo', status: true },
    { id: 4, descricao: 'Certificadora', status: true }
  ];

  tiposAlternativa = [
    { id: 1, descricao: 'Dissertativa', status: true },
    { id: 2, descricao: 'Múltipla Escolha', status: true },
    { id: 3, descricao: 'Texto de Referência', status: true },
    { id: 4, descricao: 'Imagem de Referência', status: true },
    { id: 5, descricao: 'Imagem nas Alternativas', status: true }
  ];

  niveisDificuldade = [
    { id: 1, descricao: 'Fácil', status: true },
    { id: 2, descricao: 'Médio', status: true },
    { id: 3, descricao: 'Difícil', status: true }
  ];

  disciplinas = [
    { id: 1, descricao: 'Matemática', idDisciplinaExterno: 'MAT001', status: true },
    { id: 2, descricao: 'Português', idDisciplinaExterno: 'POR001', status: true },
    { id: 3, descricao: 'História', idDisciplinaExterno: 'HIS001', status: true },
    { id: 4, descricao: 'Geografia', idDisciplinaExterno: 'GEO001', status: true },
    { id: 5, descricao: 'Ciências', idDisciplinaExterno: 'CIE001', status: true }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.configForm = this.fb.group({
      nomeSistema: ['Sistema de Avaliações'],
      versao: ['1.0.0'],
      urlApiIntegre: ['https://api.integre.com.br'],
      urlApiChatvolt: ['https://api.chatvolt.com'],
      tempoLimiteProvas: [120],
      maxTentativas: [3],
      permitirRascunho: [true],
      correcaoAutomatica: [true],
      notificacaoEmail: [true]
    });
  }

  ngOnInit(): void {}

  adicionarTipoAvaliacao(): void {
    const dialogRef = this.dialog.open(ConfigItemDialogComponent, {
      width: '400px',
      data: {
        title: 'Novo Tipo de Avaliação',
        item: null,
        type: 'tipoAvaliacao'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newId = Math.max(...this.tiposAvaliacao.map(t => t.id)) + 1;
        this.tiposAvaliacao.push({ ...result, id: newId });
        this.snackBar.open('Tipo de avaliação adicionado com sucesso!', 'Fechar', { duration: 3000 });
      }
    });
  }

  adicionarTipoAlternativa(): void {
    const dialogRef = this.dialog.open(ConfigItemDialogComponent, {
      width: '400px',
      data: {
        title: 'Novo Tipo de Alternativa',
        item: null,
        type: 'tipoAlternativa'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newId = Math.max(...this.tiposAlternativa.map(t => t.id)) + 1;
        this.tiposAlternativa.push({ ...result, id: newId });
        this.snackBar.open('Tipo de alternativa adicionado com sucesso!', 'Fechar', { duration: 3000 });
      }
    });
  }

  adicionarNivelDificuldade(): void {
    const dialogRef = this.dialog.open(ConfigItemDialogComponent, {
      width: '400px',
      data: {
        title: 'Novo Nível de Dificuldade',
        item: null,
        type: 'nivelDificuldade'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newId = Math.max(...this.niveisDificuldade.map(n => n.id)) + 1;
        this.niveisDificuldade.push({ ...result, id: newId });
        this.snackBar.open('Nível de dificuldade adicionado com sucesso!', 'Fechar', { duration: 3000 });
      }
    });
  }

  adicionarDisciplina(): void {
    const dialogRef = this.dialog.open(ConfigItemDialogComponent, {
      width: '500px',
      data: {
        title: 'Nova Disciplina',
        item: null,
        type: 'disciplina'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newId = Math.max(...this.disciplinas.map(d => d.id)) + 1;
        this.disciplinas.push({ ...result, id: newId });
        this.snackBar.open('Disciplina adicionada com sucesso!', 'Fechar', { duration: 3000 });
      }
    });
  }

  sincronizarDisciplinas(): void {
    this.snackBar.open('Sincronização com API iniciada...', 'Fechar', { duration: 2000 });
    console.log('Sincronizar disciplinas com API');
  }

  editarItem(item: any): void {
    let type = '';
    let title = '';
    let width = '400px';

    // Determinar o tipo baseado no item
    if (this.tiposAvaliacao.includes(item)) {
      type = 'tipoAvaliacao';
      title = 'Editar Tipo de Avaliação';
    } else if (this.tiposAlternativa.includes(item)) {
      type = 'tipoAlternativa';
      title = 'Editar Tipo de Alternativa';
    } else if (this.niveisDificuldade.includes(item)) {
      type = 'nivelDificuldade';
      title = 'Editar Nível de Dificuldade';
    } else if (this.disciplinas.includes(item)) {
      type = 'disciplina';
      title = 'Editar Disciplina';
      width = '500px';
    }

    const dialogRef = this.dialog.open(ConfigItemDialogComponent, {
      width: width,
      data: {
        title: title,
        item: { ...item },
        type: type
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        Object.assign(item, result);
        this.snackBar.open('Item atualizado com sucesso!', 'Fechar', { duration: 3000 });
      }
    });
  }

  excluirItem(item: any): void {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      if (this.tiposAvaliacao.includes(item)) {
        const index = this.tiposAvaliacao.indexOf(item);
        this.tiposAvaliacao.splice(index, 1);
        this.snackBar.open('Tipo de avaliação excluído com sucesso!', 'Fechar', { duration: 3000 });
      } else if (this.tiposAlternativa.includes(item)) {
        const index = this.tiposAlternativa.indexOf(item);
        this.tiposAlternativa.splice(index, 1);
        this.snackBar.open('Tipo de alternativa excluído com sucesso!', 'Fechar', { duration: 3000 });
      } else if (this.niveisDificuldade.includes(item)) {
        const index = this.niveisDificuldade.indexOf(item);
        this.niveisDificuldade.splice(index, 1);
        this.snackBar.open('Nível de dificuldade excluído com sucesso!', 'Fechar', { duration: 3000 });
      } else if (this.disciplinas.includes(item)) {
        const index = this.disciplinas.indexOf(item);
        this.disciplinas.splice(index, 1);
        this.snackBar.open('Disciplina excluída com sucesso!', 'Fechar', { duration: 3000 });
      }
    }
  }

  toggleStatus(item: any, status: boolean): void {
    item.status = status;
    this.snackBar.open(`Status ${status ? 'ativado' : 'desativado'} com sucesso!`, 'Fechar', { duration: 2000 });
  }

  salvarConfiguracoes(): void {
    if (this.configForm.valid) {
      console.log('Configurações salvas:', this.configForm.value);
      this.snackBar.open('Configurações salvas com sucesso!', 'Fechar', { duration: 3000 });
    }
  }
}

@Component({
  selector: 'config-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <form [formGroup]="itemForm" (ngSubmit)="salvar()">
      <mat-dialog-content>
        <div class="form-content">
          <mat-form-field class="full-width">
            <mat-label>Descrição</mat-label>
            <input matInput formControlName="descricao" required>
            <mat-error *ngIf="itemForm.get('descricao')?.hasError('required')">
              Descrição é obrigatória
            </mat-error>
          </mat-form-field>

          <mat-form-field class="full-width" *ngIf="data.type === 'disciplina'">
            <mat-label>ID Externo</mat-label>
            <input matInput formControlName="idDisciplinaExterno"
                   placeholder="Ex: MAT001">
          </mat-form-field>

          <div class="status-toggle">
            <mat-slide-toggle formControlName="status">
              {{ itemForm.get('status')?.value ? 'Ativo' : 'Inativo' }}
            </mat-slide-toggle>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="cancelar()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="itemForm.invalid">
          Salvar
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .form-content {
      min-width: 350px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .status-toggle {
      margin-top: 8px;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
    }
  `]
})
export class ConfigItemDialogComponent {
  itemForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ConfigItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.itemForm = this.fb.group({
      descricao: [data.item?.descricao || '', Validators.required],
      status: [data.item?.status ?? true]
    });

    // Adicionar campo idDisciplinaExterno apenas para disciplinas
    if (data.type === 'disciplina') {
      this.itemForm.addControl('idDisciplinaExterno',
        this.fb.control(data.item?.idDisciplinaExterno || ''));
    }
  }

  salvar(): void {
    if (this.itemForm.valid) {
      this.dialogRef.close(this.itemForm.value);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}

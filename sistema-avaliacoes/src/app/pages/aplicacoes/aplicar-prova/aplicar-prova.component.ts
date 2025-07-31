import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-aplicar-prova',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule,
    MatStepperModule
  ],
  template: `
    <div class="prova-container" *ngIf="!provaFinalizada">
      <!-- Cabeçalho da Prova -->
      <mat-card class="header-card">
        <div class="prova-header">
          <div class="prova-info">
            <h2>{{ avaliacao?.tipoAvaliacao?.descricao }}</h2>
            <p class="instrucoes">{{ avaliacao?.instrucao }}</p>
          </div>
          <div class="tempo-info">
            <div class="cronometro">
              <mat-icon>schedule</mat-icon>
              <span class="tempo">{{ tempoFormatado }}</span>
            </div>
            <div class="progresso">
              <mat-progress-bar 
                [value]="progressoPercentual" 
                color="primary">
              </mat-progress-bar>
              <span class="progresso-text">{{ questaoAtual + 1 }} de {{ questoes.length }} questões</span>
            </div>
          </div>
        </div>
      </mat-card>

      <!-- Navegação entre Questões -->
      <mat-card class="navegacao-card">
        <div class="navegacao-questoes">
          <button 
            *ngFor="let questao of questoes; let i = index"
            mat-button
            [class]="getQuestaoButtonClass(i)"
            (click)="irParaQuestao(i)">
            {{ i + 1 }}
          </button>
        </div>
      </mat-card>

      <!-- Questão Atual -->
      <mat-card class="questao-card" *ngIf="questaoAtualObj">
        <form [formGroup]="respostaForm">
          <div class="questao-header">
            <h3>Questão {{ questaoAtual + 1 }}</h3>
            <span class="pontuacao" *ngIf="questaoAtualObj.pontuacao">
              ({{ questaoAtualObj.pontuacao }} pontos)
            </span>
          </div>

          <!-- Contexto da Questão -->
          <div class="contexto" *ngIf="questaoAtualObj.questaoContexto?.contexto">
            <h4>Texto de Referência:</h4>
            <p class="contexto-texto">{{ questaoAtualObj.questaoContexto.contexto }}</p>
          </div>

          <!-- Pergunta -->
          <div class="pergunta">
            <p>{{ questaoAtualObj.pergunta }}</p>
            <img *ngIf="questaoAtualObj.arquivoImagem" 
                 [src]="'assets/images/' + questaoAtualObj.arquivoImagem" 
                 alt="Imagem da questão"
                 class="questao-imagem">
          </div>

          <!-- Alternativas (Múltipla Escolha) -->
          <div class="alternativas" *ngIf="isMultiplaEscolha(questaoAtualObj)">
            <mat-radio-group formControlName="alternativaSelecionada" class="alternativas-group">
              <div 
                *ngFor="let alternativa of questaoAtualObj.alternativas" 
                class="alternativa-item">
                <mat-radio-button [value]="alternativa.id" class="alternativa-radio">
                  <span class="alternativa-letra">{{ alternativa.alternativa }})</span>
                  <span class="alternativa-conteudo">{{ alternativa.conteudo }}</span>
                  <img *ngIf="alternativa.arquivoImagem" 
                       [src]="'assets/images/' + alternativa.arquivoImagem" 
                       alt="Imagem da alternativa"
                       class="alternativa-imagem">
                </mat-radio-button>
              </div>
            </mat-radio-group>
          </div>

          <!-- Resposta Dissertativa -->
          <div class="resposta-dissertativa" *ngIf="isDissertativa(questaoAtualObj)">
            <mat-form-field class="full-width">
              <mat-label>Sua resposta</mat-label>
              <textarea 
                matInput 
                formControlName="respostaDissertativa"
                rows="8"
                placeholder="Digite sua resposta aqui...">
              </textarea>
              <mat-hint>Seja claro e objetivo em sua resposta</mat-hint>
            </mat-form-field>
          </div>
        </form>
      </mat-card>

      <!-- Navegação -->
      <mat-card class="navegacao-botoes">
        <div class="botoes-nav">
          <button mat-button 
                  (click)="questaoAnterior()" 
                  [disabled]="questaoAtual === 0">
            <mat-icon>navigate_before</mat-icon>
            Anterior
          </button>

          <button mat-button (click)="salvarRascunho()">
            <mat-icon>save</mat-icon>
            Salvar Rascunho
          </button>

          <button mat-raised-button 
                  color="primary"
                  (click)="proximaQuestao()" 
                  *ngIf="questaoAtual < questoes.length - 1">
            Próxima
            <mat-icon>navigate_next</mat-icon>
          </button>

          <button mat-raised-button 
                  color="warn"
                  (click)="finalizarProva()" 
                  *ngIf="questaoAtual === questoes.length - 1">
            <mat-icon>check_circle</mat-icon>
            Finalizar Prova
          </button>
        </div>
      </mat-card>
    </div>

    <!-- Tela de Prova Finalizada -->
    <div class="prova-finalizada" *ngIf="provaFinalizada">
      <mat-card class="finalizada-card">
        <div class="finalizada-content">
          <mat-icon class="sucesso-icon">check_circle</mat-icon>
          <h2>Prova Finalizada com Sucesso!</h2>
          <p>Sua avaliação foi enviada e será corrigida em breve.</p>
          
          <div class="resumo">
            <div class="resumo-item">
              <strong>Questões respondidas:</strong>
              <span>{{ getQuestoesRespondidas() }} de {{ questoes.length }}</span>
            </div>
            <div class="resumo-item">
              <strong>Tempo total:</strong>
              <span>{{ tempoTotalFormatado }}</span>
            </div>
            <div class="resumo-item">
              <strong>Data de finalização:</strong>
              <span>{{ dataFinalizacao | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
          </div>

          <div class="acoes-finais">
            <button mat-raised-button color="primary" routerLink="/aplicacoes">
              <mat-icon>list</mat-icon>
              Voltar para Aplicações
            </button>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .prova-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .header-card {
      margin-bottom: 20px;
    }

    .prova-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }

    .prova-info h2 {
      margin: 0 0 10px 0;
      color: #1976d2;
    }

    .instrucoes {
      margin: 0;
      color: #666;
      max-width: 600px;
    }

    .tempo-info {
      text-align: right;
      min-width: 200px;
    }

    .cronometro {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.2em;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 10px;
    }

    .progresso {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .progresso-text {
      font-size: 0.9em;
      color: #666;
    }

    .navegacao-card {
      margin-bottom: 20px;
    }

    .navegacao-questoes {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .questao-nao-respondida {
      background-color: #f5f5f5 !important;
      color: #666 !important;
    }

    .questao-respondida {
      background-color: #e8f5e8 !important;
      color: #2d5a2d !important;
    }

    .questao-atual {
      background-color: #1976d2 !important;
      color: white !important;
    }

    .questao-card {
      margin-bottom: 20px;
      min-height: 400px;
    }

    .questao-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }

    .pontuacao {
      color: #666;
      font-weight: normal;
    }

    .contexto {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .contexto h4 {
      margin: 0 0 10px 0;
      color: #1976d2;
    }

    .contexto-texto {
      margin: 0;
      line-height: 1.6;
    }

    .pergunta {
      margin-bottom: 20px;
    }

    .pergunta p {
      font-size: 1.1em;
      line-height: 1.6;
      margin-bottom: 10px;
    }

    .questao-imagem,
    .alternativa-imagem {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin-top: 10px;
    }

    .alternativa-imagem {
      max-width: 200px;
    }

    .alternativas-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .alternativa-item {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 12px;
      transition: all 0.2s;
    }

    .alternativa-item:hover {
      background-color: #f5f5f5;
    }

    .alternativa-radio {
      width: 100%;
    }

    .alternativa-letra {
      font-weight: bold;
      margin-right: 8px;
      color: #1976d2;
    }

    .alternativa-conteudo {
      line-height: 1.5;
    }

    .resposta-dissertativa {
      margin-top: 20px;
    }

    .navegacao-botoes {
      position: sticky;
      bottom: 20px;
    }

    .botoes-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .prova-finalizada {
      padding: 40px 20px;
      text-align: center;
    }

    .finalizada-card {
      max-width: 600px;
      margin: 0 auto;
    }

    .finalizada-content {
      padding: 40px;
    }

    .sucesso-icon {
      font-size: 4em;
      width: 4em;
      height: 4em;
      color: #4caf50;
      margin-bottom: 20px;
    }

    .resumo {
      margin: 30px 0;
      text-align: left;
    }

    .resumo-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .acoes-finais {
      margin-top: 30px;
    }

    @media (max-width: 768px) {
      .prova-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .tempo-info {
        text-align: left;
        width: 100%;
      }

      .botoes-nav {
        flex-direction: column;
        gap: 12px;
      }

      .botoes-nav button {
        width: 100%;
      }
    }
  `]
})
export class AplicarProvaComponent implements OnInit, OnDestroy {
  respostaForm: FormGroup;
  participanteId: number | null = null;
  questaoAtual = 0;
  provaFinalizada = false;
  tempoInicio = new Date();
  tempoDecorrido = 0;
  dataFinalizacao: Date | null = null;
  
  private timerSubscription?: Subscription;

  // Dados simulados
  avaliacao = {
    id: 1,
    tipoAvaliacao: { descricao: 'Avaliação Diagnóstica' },
    instrucao: 'Leia atentamente cada questão e responda da melhor forma possível. Você tem tempo ilimitado para concluir esta avaliação.'
  };

  questoes = [
    {
      id: 1,
      pergunta: 'Qual é a capital do Brasil?',
      pontuacao: 2,
      tipoAlternativa: { descricao: 'Múltipla Escolha' },
      alternativas: [
        { id: 1, alternativa: 'A', conteudo: 'São Paulo', correta: false },
        { id: 2, alternativa: 'B', conteudo: 'Rio de Janeiro', correta: false },
        { id: 3, alternativa: 'C', conteudo: 'Brasília', correta: true },
        { id: 4, alternativa: 'D', conteudo: 'Salvador', correta: false }
      ]
    },
    {
      id: 2,
      pergunta: 'Explique a importância da fotossíntese para os seres vivos.',
      pontuacao: 3,
      tipoAlternativa: { descricao: 'Dissertativa' }
    },
    {
      id: 3,
      pergunta: 'Resolva a equação: 2x + 5 = 15',
      pontuacao: 2.5,
      tipoAlternativa: { descricao: 'Múltipla Escolha' },
      alternativas: [
        { id: 5, alternativa: 'A', conteudo: 'x = 5', correta: true },
        { id: 6, alternativa: 'B', conteudo: 'x = 10', correta: false },
        { id: 7, alternativa: 'C', conteudo: 'x = 7', correta: false },
        { id: 8, alternativa: 'D', conteudo: 'x = 3', correta: false }
      ]
    }
  ];

  respostasUsuario: any = {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.respostaForm = this.fb.group({
      alternativaSelecionada: [''],
      respostaDissertativa: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.participanteId = +params['id'];
      this.iniciarProva();
    });

    this.iniciarCronometro();
    this.carregarRespostaSalva();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  iniciarProva(): void {
    this.tempoInicio = new Date();
    console.log('Prova iniciada para participante:', this.participanteId);
  }

  iniciarCronometro(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.tempoDecorrido = Math.floor((new Date().getTime() - this.tempoInicio.getTime()) / 1000);
    });
  }

  get questaoAtualObj() {
    return this.questoes[this.questaoAtual];
  }

  get progressoPercentual(): number {
    return ((this.questaoAtual + 1) / this.questoes.length) * 100;
  }

  get tempoFormatado(): string {
    const horas = Math.floor(this.tempoDecorrido / 3600);
    const minutos = Math.floor((this.tempoDecorrido % 3600) / 60);
    const segundos = this.tempoDecorrido % 60;

    if (horas > 0) {
      return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

  get tempoTotalFormatado(): string {
    return this.tempoFormatado;
  }

  isMultiplaEscolha(questao: any): boolean {
    return questao.tipoAlternativa?.descricao === 'Múltipla Escolha';
  }

  isDissertativa(questao: any): boolean {
    return questao.tipoAlternativa?.descricao === 'Dissertativa';
  }

  getQuestaoButtonClass(index: number): string {
    if (index === this.questaoAtual) {
      return 'questao-atual';
    }
    if (this.isQuestaoRespondida(index)) {
      return 'questao-respondida';
    }
    return 'questao-nao-respondida';
  }

  isQuestaoRespondida(index: number): boolean {
    const questao = this.questoes[index];
    const resposta = this.respostasUsuario[questao.id];
    
    if (this.isMultiplaEscolha(questao)) {
      return resposta?.alternativaSelecionada;
    }
    if (this.isDissertativa(questao)) {
      return resposta?.respostaDissertativa?.trim();
    }
    return false;
  }

  irParaQuestao(index: number): void {
    this.salvarRespostaAtual();
    this.questaoAtual = index;
    this.carregarRespostaSalva();
  }

  questaoAnterior(): void {
    if (this.questaoAtual > 0) {
      this.irParaQuestao(this.questaoAtual - 1);
    }
  }

  proximaQuestao(): void {
    if (this.questaoAtual < this.questoes.length - 1) {
      this.irParaQuestao(this.questaoAtual + 1);
    }
  }

  carregarRespostaSalva(): void {
    const questao = this.questaoAtualObj;
    const resposta = this.respostasUsuario[questao.id];
    
    if (resposta) {
      this.respostaForm.patchValue({
        alternativaSelecionada: resposta.alternativaSelecionada || '',
        respostaDissertativa: resposta.respostaDissertativa || ''
      });
    } else {
      this.respostaForm.reset();
    }
  }

  salvarRespostaAtual(): void {
    const questao = this.questaoAtualObj;
    const formValue = this.respostaForm.value;
    
    this.respostasUsuario[questao.id] = {
      questaoId: questao.id,
      alternativaSelecionada: formValue.alternativaSelecionada,
      respostaDissertativa: formValue.respostaDissertativa,
      dataResposta: new Date()
    };
  }

  salvarRascunho(): void {
    this.salvarRespostaAtual();
    this.snackBar.open('Rascunho salvo com sucesso!', 'Fechar', { duration: 2000 });
  }

  finalizarProva(): void {
    this.salvarRespostaAtual();
    
    const questoesNaoRespondidas = this.questoes.filter((_, index) => !this.isQuestaoRespondida(index));
    
    if (questoesNaoRespondidas.length > 0) {
      const confirmacao = confirm(
        `Você ainda tem ${questoesNaoRespondidas.length} questão(ões) não respondida(s). Deseja finalizar mesmo assim?`
      );
      
      if (!confirmacao) {
        return;
      }
    }

    // Finalizar prova
    this.dataFinalizacao = new Date();
    this.provaFinalizada = true;
    
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    // Simular envio das respostas
    console.log('Respostas enviadas:', this.respostasUsuario);
    
    this.snackBar.open('Prova finalizada com sucesso!', 'Fechar', { duration: 3000 });
  }

  getQuestoesRespondidas(): number {
    return this.questoes.filter((_, index) => this.isQuestaoRespondida(index)).length;
  }
}

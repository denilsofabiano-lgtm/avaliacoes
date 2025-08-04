import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  AvaliacaoQuestao, 
  AvaliacaoQuestaoRequest, 
  AvaliacaoQuestaoResponse,
  ReordenarQuestoesRequest,
  AdicionarMultiplasQuestoesRequest,
  Questao,
  ApiResponse 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AvaliacaoQuestaoService {
  private apiUrl = `${environment.apiUrl}/avaliacao-questoes`;

  constructor(private http: HttpClient) {}

  /**
   * Listar questões de uma avaliação
   */
  getQuestoesDaAvaliacao(avaliacaoId: number): Observable<AvaliacaoQuestaoResponse> {
    return this.http.get<AvaliacaoQuestaoResponse>(`${this.apiUrl}/avaliacao/${avaliacaoId}`)
      .pipe(
        catchError(error => {
          console.group('❌ AvaliacaoQuestaoService.getQuestoesDaAvaliacao Error');
          console.log('Error object:', error);
          console.log('Error status:', error?.status);
          console.log('Error message:', error?.message);
          console.log('Avaliacao ID:', avaliacaoId);
          console.groupEnd();

          // Fallback com dados mock
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Usando dados mock para questões da avaliação');
            return of(this.getMockQuestoesDaAvaliacao(avaliacaoId));
          }

          return throwError(() => error);
        })
      );
  }

  /**
   * Listar questões disponíveis para adicionar à avaliação
   */
  getQuestoesDisponiveis(avaliacaoId: number): Observable<ApiResponse<Questao[]>> {
    return this.http.get<ApiResponse<Questao[]>>(`${this.apiUrl}/avaliacao/${avaliacaoId}/disponiveis`)
      .pipe(
        catchError(error => {
          console.group('❌ AvaliacaoQuestaoService.getQuestoesDisponiveis Error');
          console.log('Error object:', error);
          console.log('Error status:', error?.status);
          console.log('Error message:', error?.message);
          console.log('Avaliacao ID:', avaliacaoId);
          console.groupEnd();

          // Fallback com dados mock
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Usando dados mock para questões disponíveis');
            return of(this.getMockQuestoesDisponiveis());
          }

          return throwError(() => error);
        })
      );
  }

  /**
   * Adicionar questão à avaliação
   */
  adicionarQuestao(request: AvaliacaoQuestaoRequest): Observable<ApiResponse<AvaliacaoQuestao>> {
    return this.http.post<ApiResponse<AvaliacaoQuestao>>(this.apiUrl, request)
      .pipe(
        catchError(error => {
          console.group('❌ AvaliacaoQuestaoService.adicionarQuestao Error');
          console.log('Error object:', error);
          console.log('Error status:', error?.status);
          console.log('Error message:', error?.message);
          console.log('Request data:', request);
          console.groupEnd();

          // Fallback para demonstração
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Simulando adição de questão - backend indisponível');
            return of({
              message: 'Questão adicionada com sucesso (simulação)',
              data: {
                id: Math.floor(Math.random() * 1000),
                avaliacaoId: request.avaliacaoId,
                questaoId: request.questaoId,
                ordem: request.ordem || 1
              } as AvaliacaoQuestao
            });
          }

          return throwError(() => error);
        })
      );
  }

  /**
   * Remover questão da avaliação
   */
  removerQuestao(avaliacaoQuestaoId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${avaliacaoQuestaoId}`)
      .pipe(
        catchError(error => {
          console.group('❌ AvaliacaoQuestaoService.removerQuestao Error');
          console.log('Error object:', error);
          console.log('Error status:', error?.status);
          console.log('Error message:', error?.message);
          console.log('AvaliacaoQuestao ID:', avaliacaoQuestaoId);
          console.groupEnd();

          // Fallback para demonstração
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Simulando remoção de questão - backend indisponível');
            return of({
              message: 'Questão removida com sucesso (simulação)'
            });
          }

          return throwError(() => error);
        })
      );
  }

  /**
   * Reordenar questões da avaliação
   */
  reordenarQuestoes(avaliacaoId: number, request: ReordenarQuestoesRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/avaliacao/${avaliacaoId}/reordenar`, request)
      .pipe(
        catchError(error => {
          console.group('❌ AvaliacaoQuestaoService.reordenarQuestoes Error');
          console.log('Error object:', error);
          console.log('Error status:', error?.status);
          console.log('Error message:', error?.message);
          console.log('Request data:', request);
          console.groupEnd();

          // Fallback para demonstração
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Simulando reordenação - backend indisponível');
            return of({
              message: 'Ordem das questões atualizada com sucesso (simulação)'
            });
          }

          return throwError(() => error);
        })
      );
  }

  /**
   * Adicionar múltiplas questões à avaliação
   */
  adicionarMultiplasQuestoes(avaliacaoId: number, request: AdicionarMultiplasQuestoesRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/avaliacao/${avaliacaoId}/adicionar-multiplas`, request)
      .pipe(
        catchError(error => {
          console.group('❌ AvaliacaoQuestaoService.adicionarMultiplasQuestoes Error');
          console.log('Error object:', error);
          console.log('Error status:', error?.status);
          console.log('Error message:', error?.message);
          console.log('Request data:', request);
          console.groupEnd();

          // Fallback para demonstração
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Simulando adição múltipla - backend indisponível');
            return of({
              message: `${request.questoesIds.length} questões adicionadas com sucesso (simulação)`,
              adicionadas: request.questoesIds.length,
              erros: []
            });
          }

          return throwError(() => error);
        })
      );
  }

  // Mock data methods for fallback
  private getMockQuestoesDaAvaliacao(avaliacaoId: number): AvaliacaoQuestaoResponse {
    return {
      message: 'Questões listadas com sucesso (mock)',
      data: [
        {
          id: 1,
          avaliacaoId: avaliacaoId,
          questaoId: 1,
          ordem: 1,
          questao: {
            id: 1,
            pergunta: 'Qual é a capital do Brasil?',
            pontuacao: 2,
            geradorIa: false,
            statusQuestaoId: 1,
            tipoAlternativaId: 1,
            disciplina: { id: 1, descricao: 'Geografia', idDisciplinaExterno: 'GEO-001', status: true },
            tipoAlternativa: { id: 1, descricao: 'Múltipla Escolha', status: true }
          }
        },
        {
          id: 2,
          avaliacaoId: avaliacaoId,
          questaoId: 2,
          ordem: 2,
          questao: {
            id: 2,
            pergunta: 'Explique o processo de fotossíntese.',
            pontuacao: 3,
            geradorIa: false,
            statusQuestaoId: 1,
            tipoAlternativaId: 2,
            disciplina: { id: 2, descricao: 'Biologia', idDisciplinaExterno: 'BIO-001', status: true },
            tipoAlternativa: { id: 2, descricao: 'Dissertativa', status: true }
          }
        }
      ],
      total: 2
    };
  }

  private getMockQuestoesDisponiveis(): ApiResponse<Questao[]> {
    return {
      message: 'Questões disponíveis listadas com sucesso (mock)',
      data: [
        {
          id: 3,
          pergunta: 'Resolva a equação: 2x + 5 = 15',
          pontuacao: 2.5,
          geradorIa: false,
          statusQuestaoId: 1,
          tipoAlternativaId: 1,
          disciplina: { id: 3, descricao: 'Matemática', idDisciplinaExterno: 'MAT-001', status: true },
          tipoAlternativa: { id: 1, descricao: 'Múltipla Escolha', status: true },
          nivelDificuldade: { id: 2, descricao: 'Médio', status: true }
        },
        {
          id: 4,
          pergunta: 'Quais são os principais biomas brasileiros?',
          pontuacao: 3,
          geradorIa: false,
          statusQuestaoId: 1,
          tipoAlternativaId: 2,
          disciplina: { id: 1, descricao: 'Geografia', idDisciplinaExterno: 'GEO-001', status: true },
          tipoAlternativa: { id: 2, descricao: 'Dissertativa', status: true },
          nivelDificuldade: { id: 2, descricao: 'Médio', status: true }
        },
        {
          id: 5,
          pergunta: 'Defina o conceito de pH.',
          pontuacao: 2,
          geradorIa: false,
          statusQuestaoId: 1,
          tipoAlternativaId: 2,
          disciplina: { id: 4, descricao: 'Química', idDisciplinaExterno: 'QUI-001', status: true },
          tipoAlternativa: { id: 2, descricao: 'Dissertativa', status: true },
          nivelDificuldade: { id: 1, descricao: 'Fácil', status: true }
        }
      ],
      total: 3
    };
  }
}

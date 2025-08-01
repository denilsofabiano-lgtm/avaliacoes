import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Avaliacao } from '../models/avaliacao.model';
import { PaginatedResponse, ApiResponse } from '../models/usuario.model';

export interface AvaliacaoFilters {
  page?: number;
  limit?: number;
  search?: string;
  tipoAvaliacaoId?: number;
  statusAvaliacaoId?: number;
  responsavelId?: number;
}

export interface CreateAvaliacaoRequest {
  instrucao: string;
  tipoAvaliacaoId: number;
  statusAvaliacaoId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AvaliacaoService {
  private apiUrl = `${environment.apiUrl}/avaliacoes`;

  constructor(private http: HttpClient) {}

  private getFallbackAvaliacoes(): PaginatedResponse<Avaliacao> {
    const mockAvaliacoes: Avaliacao[] = [
      {
        id: 1,
        instrucao: 'Avaliação diagnóstica de Matemática para identificar o nível de conhecimento dos alunos',
        tipoAvaliacao: { id: 1, descricao: 'Diagnóstica', status: true },
        responsavel: { id: 1, nome: 'Prof. Ana Silva', email: 'ana@escola.com', roles: [], status: true },
        statusAvaliacao: { id: 1, descricao: 'Pendente', status: true },
        questoes: [],
        totalQuestoes: 15,
        dataCadastro: '2024-01-15'
      },
      {
        id: 2,
        instrucao: 'Avaliação processual de Português - Interpretação de texto e gramática',
        tipoAvaliacao: { id: 2, descricao: 'Processual', status: true },
        responsavel: { id: 2, nome: 'Prof. João Santos', email: 'joao@escola.com', roles: [], status: true },
        statusAvaliacao: { id: 2, descricao: 'Aprovado', status: true },
        questoes: [],
        totalQuestoes: 20,
        dataCadastro: '2024-02-10'
      },
      {
        id: 3,
        instrucao: 'Avaliação final de Ciências - Sistema Solar e meio ambiente',
        tipoAvaliacao: { id: 3, descricao: 'Final de Ciclo', status: true },
        responsavel: { id: 3, nome: 'Prof. Maria Costa', email: 'maria@escola.com', roles: [], status: true },
        statusAvaliacao: { id: 1, descricao: 'Pendente', status: true },
        questoes: [],
        totalQuestoes: 25,
        dataCadastro: '2024-03-05'
      }
    ];

    return {
      data: mockAvaliacoes,
      pagination: {
        total: mockAvaliacoes.length,
        page: 1,
        limit: 10,
        pages: 1
      }
    };
  }

  getAvaliacoes(filters: AvaliacaoFilters = {}): Observable<PaginatedResponse<Avaliacao>> {
    console.log('🔄 AvaliacaoService.getAvaliacoes - fazendo requisição para:', this.apiUrl);
    console.log('🔄 Filtros aplicados:', filters);

    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.tipoAvaliacaoId) params = params.set('tipoAvaliacaoId', filters.tipoAvaliacaoId.toString());
    if (filters.statusAvaliacaoId) params = params.set('statusAvaliacaoId', filters.statusAvaliacaoId.toString());
    if (filters.responsavelId) params = params.set('responsavelId', filters.responsavelId.toString());

    return this.http.get<PaginatedResponse<Avaliacao>>(this.apiUrl, { params })
      .pipe(
        catchError(error => {
          console.group('❌ AvaliacaoService.getAvaliacoes Error');
          console.log('Error object:', error);
          console.log('Error status:', error?.status);
          console.log('Error message:', error?.message);
          console.log('API URL tentada:', this.apiUrl);
          console.log('Params:', params.toString());
          console.groupEnd();

          // Se for erro de conexão (backend indisponível), retorna dados de fallback
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Usando fallback de avaliações - backend indisponível');
            return of(this.getFallbackAvaliacoes());
          }

          console.log('📤 Propagando erro do AvaliacaoService');
          return throwError(() => error);
        })
      );
  }

  getAvaliacao(id: number): Observable<Avaliacao> {
    return this.http.get<Avaliacao>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.group('❌ AvaliacaoService.getAvaliacao Error');
          console.log('Error object:', error);
          console.log('Error status:', error?.status);
          console.log('Error message:', error?.message);
          console.log('Avaliacao ID:', id);
          console.log('API URL tentada:', `${this.apiUrl}/${id}`);
          console.groupEnd();

          // Se for erro de conexão, retorna erro tratado
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Backend indisponível para buscar avaliação');
          }

          console.log('📤 Propagando erro do getAvaliacao');
          return throwError(() => error);
        })
      );
  }

  createAvaliacao(avaliacao: CreateAvaliacaoRequest): Observable<ApiResponse<Avaliacao>> {
    return this.http.post<ApiResponse<Avaliacao>>(this.apiUrl, avaliacao)
      .pipe(
        catchError(error => {
          console.error('Erro ao criar avaliação:', error);
          return throwError(() => error);
        })
      );
  }

  updateAvaliacao(id: number, avaliacao: Partial<CreateAvaliacaoRequest>): Observable<ApiResponse<Avaliacao>> {
    return this.http.put<ApiResponse<Avaliacao>>(`${this.apiUrl}/${id}`, avaliacao)
      .pipe(
        catchError(error => {
          console.error('Erro ao atualizar avaliação:', error);
          return throwError(() => error);
        })
      );
  }

  deleteAvaliacao(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.log('❌ Delete avaliação error:', error);

          // Se for erro de conexão, simula sucesso
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Simulando exclusão de avaliação - backend indisponível');
            return of({
              message: 'Avaliação excluída com sucesso (simulação)'
            } as ApiResponse<any>);
          }

          return throwError(() => error);
        })
      );
  }

  addQuestoes(id: number, questoesIds: number[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/questoes`, { questoesIds })
      .pipe(
        catchError(error => {
          console.error('Erro ao adicionar questões:', error);
          return throwError(() => error);
        })
      );
  }

  removeQuestao(avaliacaoId: number, questaoId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${avaliacaoId}/questoes/${questaoId}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao remover questão:', error);
          return throwError(() => error);
        })
      );
  }

  duplicateAvaliacao(id: number): Observable<ApiResponse<Avaliacao>> {
    return this.http.post<ApiResponse<Avaliacao>>(`${this.apiUrl}/${id}/duplicar`, {})
      .pipe(
        catchError(error => {
          console.log('❌ Duplicate avaliação error:', error);

          // Se for erro de conexão, simula sucesso
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Simulando duplicação de avaliação - backend indisponível');
            return of({
              message: 'Avaliação duplicada com sucesso (simulação)',
              data: {
                id: Date.now(),
                instrucao: 'Cópia da avaliação',
                dataCadastro: new Date().toISOString()
              }
            } as ApiResponse<Avaliacao>);
          }

          return throwError(() => error);
        })
      );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
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

  getAvaliacoes(filters: AvaliacaoFilters = {}): Observable<PaginatedResponse<Avaliacao>> {
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
          console.error('Erro ao buscar avaliações:', error);
          return throwError(() => error);
        })
      );
  }

  getAvaliacao(id: number): Observable<Avaliacao> {
    return this.http.get<Avaliacao>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar avaliação:', error);
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
          console.error('Erro ao deletar avaliação:', error);
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
          console.error('Erro ao duplicar avaliação:', error);
          return throwError(() => error);
        })
      );
  }
}

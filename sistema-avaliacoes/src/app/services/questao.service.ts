import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Questao, PaginatedResponse, ApiResponse } from '../models';

export interface QuestaoFilters {
  page?: number;
  limit?: number;
  search?: string;
  disciplinaId?: number;
  tipoAlternativaId?: number;
  nivelDificuldadeId?: number;
  ciclo?: string;
  fase?: string;
  geradorIa?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class QuestaoService {
  private apiUrl = `${environment.apiUrl}/questoes`;

  constructor(private http: HttpClient) {}

  getQuestoes(filters: QuestaoFilters = {}): Observable<PaginatedResponse<Questao>> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.disciplinaId) params = params.set('disciplinaId', filters.disciplinaId.toString());
    if (filters.tipoAlternativaId) params = params.set('tipoAlternativaId', filters.tipoAlternativaId.toString());
    if (filters.nivelDificuldadeId) params = params.set('nivelDificuldadeId', filters.nivelDificuldadeId.toString());
    if (filters.ciclo) params = params.set('ciclo', filters.ciclo);
    if (filters.fase) params = params.set('fase', filters.fase);
    if (filters.geradorIa !== undefined) params = params.set('geradorIa', filters.geradorIa.toString());

    return this.http.get<PaginatedResponse<Questao>>(this.apiUrl, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar questões:', error);
          return throwError(() => error);
        })
      );
  }

  getQuestao(id: number): Observable<Questao> {
    return this.http.get<Questao>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar questão:', error);
          return throwError(() => error);
        })
      );
  }

  createQuestao(questao: Partial<Questao>): Observable<ApiResponse<Questao>> {
    return this.http.post<ApiResponse<Questao>>(this.apiUrl, questao)
      .pipe(
        catchError(error => {
          console.error('Erro ao criar questão:', error);
          return throwError(() => error);
        })
      );
  }

  updateQuestao(id: number, questao: Partial<Questao>): Observable<ApiResponse<Questao>> {
    return this.http.put<ApiResponse<Questao>>(`${this.apiUrl}/${id}`, questao)
      .pipe(
        catchError(error => {
          console.error('Erro ao atualizar questão:', error);
          return throwError(() => error);
        })
      );
  }

  deleteQuestao(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao deletar questão:', error);
          return throwError(() => error);
        })
      );
  }

  duplicateQuestao(id: number): Observable<ApiResponse<Questao>> {
    return this.http.post<ApiResponse<Questao>>(`${this.apiUrl}/${id}/duplicar`, {})
      .pipe(
        catchError(error => {
          console.error('Erro ao duplicar questão:', error);
          return throwError(() => error);
        })
      );
  }

  reportProblema(id: number, descricao: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/problema`, { descricao })
      .pipe(
        catchError(error => {
          console.error('Erro ao reportar problema:', error);
          return throwError(() => error);
        })
      );
  }

  importQuestoes(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/import`, formData)
      .pipe(
        catchError(error => {
          console.error('Erro ao importar questões:', error);
          return throwError(() => error);
        })
      );
  }

  exportQuestoes(filters: QuestaoFilters = {}): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get(`${this.apiUrl}/export`, { 
      params,
      responseType: 'blob' 
    }).pipe(
      catchError(error => {
        console.error('Erro ao exportar questões:', error);
        return throwError(() => error);
      })
    );
  }
}

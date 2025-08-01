import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ErrorHandlerService } from './error-handler.service';

export interface DashboardData {
  resumo_geral: {
    total_usuarios: number;
    total_avaliacoes: number;
    total_questoes: number;
    total_participacoes: number;
    participacoes_concluidas: number;
    taxa_conclusao: number;
  };
  usuarios_por_role: {
    professores: number;
    alunos: number;
    admins: number;
  };
}

export interface RelatorioAvaliacao {
  id: number;
  instrucao: string;
  tipo_avaliacao: string;
  responsavel: string;
  total_participantes: number;
  finalizados: number;
  media_percentual: number;
}

export interface RelatorioAluno {
  id: number;
  nome: string;
  email: string;
  total_avaliacoes: number;
  avaliacoes_concluidas: number;
  media_geral: number;
  ultima_avaliacao: string;
}

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private apiUrl = `${environment.apiUrl}/relatorios`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`)
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar dados do dashboard:', error);
          return throwError(() => error);
        })
      );
  }

  getRelatorioAvaliacoes(dataInicio?: string, dataFim?: string): Observable<{ data: RelatorioAvaliacao[] }> {
    let params = new HttpParams();
    if (dataInicio) params = params.set('dataInicio', dataInicio);
    if (dataFim) params = params.set('dataFim', dataFim);

    return this.http.get<{ data: RelatorioAvaliacao[] }>(`${this.apiUrl}/avaliacoes`, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar relatório de avaliações:', error);
          return throwError(() => error);
        })
      );
  }

  getRelatorioAlunos(): Observable<{ data: RelatorioAluno[] }> {
    return this.http.get<{ data: RelatorioAluno[] }>(`${this.apiUrl}/alunos`)
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar relatório de alunos:', error);
          return throwError(() => error);
        })
      );
  }

  getRelatorioQuestoes(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/questoes`)
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar relatório de questões:', error);
          return throwError(() => error);
        })
      );
  }
}

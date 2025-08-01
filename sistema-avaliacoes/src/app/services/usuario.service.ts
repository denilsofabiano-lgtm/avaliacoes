import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario, PaginatedResponse, ApiResponse, UserRole } from '../models/usuario.model';
import { ErrorHandlerService } from './error-handler.service';

export interface UsuarioFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getUsuarios(filters: UsuarioFilters = {}): Observable<PaginatedResponse<Usuario>> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.status !== undefined) params = params.set('status', filters.status.toString());

    return this.http.get<PaginatedResponse<Usuario>>(this.apiUrl, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar usuários:', error);
          return throwError(() => error);
        })
      );
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar usuário:', error);
          return throwError(() => error);
        })
      );
  }

  createUsuario(usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(this.apiUrl, usuario)
      .pipe(
        catchError(error => {
          console.error('Erro ao criar usuário:', error);
          return throwError(() => error);
        })
      );
  }

  updateUsuario(id: number, usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`, usuario)
      .pipe(
        catchError(error => {
          console.error('Erro ao atualizar usuário:', error);
          return throwError(() => error);
        })
      );
  }

  deleteUsuario(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao deletar usuário:', error);
          return throwError(() => error);
        })
      );
  }

  reactivateUsuario(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/reativar`, {})
      .pipe(
        catchError(error => {
          console.error('Erro ao reativar usuário:', error);
          return throwError(() => error);
        })
      );
  }

  resetPassword(id: number): Observable<ApiResponse<{ senha_temporaria: string }>> {
    return this.http.post<ApiResponse<{ senha_temporaria: string }>>(`${this.apiUrl}/${id}/reset-password`, {})
      .pipe(
        catchError(error => {
          console.error('Erro ao resetar senha:', error);
          return throwError(() => error);
        })
      );
  }

  // Métodos compatíveis com o componente
  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar usuários:', error);
          return throwError(() => error);
        })
      );
  }

  getById(id: number): Observable<Usuario> {
    return this.getUsuario(id);
  }

  create(usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario)
      .pipe(
        catchError(error => {
          console.error('Erro ao criar usuário:', error);
          return throwError(() => error);
        })
      );
  }

  update(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario)
      .pipe(
        catchError(error => {
          console.error('Erro ao atualizar usuário:', error);
          return throwError(() => error);
        })
      );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao deletar usuário:', error);
          return throwError(() => error);
        })
      );
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {})
      .pipe(
        catchError(error => {
          console.error('Erro ao alterar status do usuário:', error);
          return throwError(() => error);
        })
      );
  }
}

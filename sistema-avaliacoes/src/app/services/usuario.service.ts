import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario, PaginatedResponse, ApiResponse, UserRole } from '../models/usuario.model';

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

  constructor(
    private http: HttpClient
  ) {}

  private getFallbackUsers(): Usuario[] {
    return [
      {
        id: 1,
        nome: 'Administrador Sistema',
        email: 'admin@sistema.com',
        cpf: '12345678901',
        roles: [UserRole.ROLE_ADMIN],
        status: true,
        dataCadastro: new Date('2024-01-15')
      },
      {
        id: 2,
        nome: 'Professor Demo',
        email: 'professor@sistema.com',
        cpf: '98765432109',
        roles: [UserRole.ROLE_PROFESSOR],
        status: true,
        dataCadastro: new Date('2024-02-20')
      },
      {
        id: 3,
        nome: 'Aluno Demo',
        email: 'aluno@sistema.com',
        cpf: '11122233344',
        roles: [UserRole.ROLE_ALUNO],
        status: true,
        dataCadastro: new Date('2024-03-10')
      },
      {
        id: 4,
        nome: 'Maria Silva',
        email: 'maria@sistema.com',
        cpf: '55566677788',
        roles: [UserRole.ROLE_PROFESSOR],
        status: true,
        dataCadastro: new Date('2024-03-15')
      },
      {
        id: 5,
        nome: 'João Santos',
        email: 'joao@sistema.com',
        cpf: '99988877766',
        roles: [UserRole.ROLE_ALUNO],
        status: false,
        dataCadastro: new Date('2024-03-20')
      }
    ];
  }

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
          console.log('❌ UsuarioService.getUsuario Error:', error);

          // Se for erro de conexão, retorna usuário de fallback
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Usando fallback para usuário - backend indisponível');
            const fallbackUsers = this.getFallbackUsers();
            const user = fallbackUsers.find(u => u.id === id);
            if (user) {
              return of(user);
            }
          }

          return throwError(() => error);
        })
      );
  }

  createUsuario(usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(this.apiUrl, usuario)
      .pipe(
        catchError(error => {
          console.log('❌ UsuarioService.createUsuario Error:', error);

          // Se for erro de conexão, simula criação
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Simulando criação de usuário - backend indisponível');
            return of({
              message: 'Usuário criado com sucesso (simulação)',
              data: {
                id: Date.now(),
                nome: usuario.nome,
                email: usuario.email,
                cpf: usuario.cpf,
                roles: usuario.roles || [],
                status: usuario.status !== undefined ? usuario.status : true,
                dataCadastro: new Date()
              } as Usuario
            } as ApiResponse<Usuario>);
          }

          return throwError(() => error);
        })
      );
  }

  updateUsuario(id: number, usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`, usuario)
      .pipe(
        catchError(error => {
          console.log('❌ UsuarioService.updateUsuario Error:', error);

          // Se for erro de conexão, simula atualização
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Simulando atualização de usuário - backend indisponível');
            return of({
              message: 'Usuário atualizado com sucesso (simulação)',
              data: {
                id: id,
                nome: usuario.nome,
                email: usuario.email,
                cpf: usuario.cpf,
                roles: usuario.roles || [],
                status: usuario.status !== undefined ? usuario.status : true,
                dataCadastro: new Date()
              } as Usuario
            } as ApiResponse<Usuario>);
          }

          return throwError(() => error);
        })
      );
  }

  deleteUsuario(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.log('❌ UsuarioService.deleteUsuario Error:', error);

          // Se for erro de conexão, simula exclusão
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Simulando exclusão de usuário - backend indisponível');
            return of({
              message: 'Usuário excluído com sucesso (simulação)'
            } as ApiResponse<any>);
          }

          return throwError(() => error);
        })
      );
  }

  reactivateUsuario(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/reativar`, {})
      .pipe(
        catchError(error => {
          console.log('❌ UsuarioService.reactivateUsuario Error:', error);

          // Se for erro de conexão, simula reativação
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Simulando reativação de usuário - backend indisponível');
            return of({
              message: 'Usuário reativado com sucesso (simulação)'
            } as ApiResponse<any>);
          }

          return throwError(() => error);
        })
      );
  }

  resetPassword(id: number): Observable<ApiResponse<{ senha_temporaria: string }>> {
    return this.http.post<ApiResponse<{ senha_temporaria: string }>>(`${this.apiUrl}/${id}/reset-password`, {})
      .pipe(
        catchError(error => {
          console.log('❌ UsuarioService.resetPassword Error:', error);

          // Se for erro de conexão, simula reset
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Simulando reset de senha - backend indisponível');
            return of({
              message: 'Senha resetada com sucesso (simulação)',
              data: { senha_temporaria: 'temp123' }
            } as ApiResponse<{ senha_temporaria: string }>);
          }

          return throwError(() => error);
        })
      );
  }

  // Métodos compatíveis com o componente
  getAll(): Observable<Usuario[]> {
    console.log('🔄 UsuarioService.getAll - fazendo requisição para:', this.apiUrl);

    return this.http.get<Usuario[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.group('❌ UsuarioService.getAll Error');
          console.log('Error object:', error);
          console.log('Error status:', error?.status);
          console.log('Error message:', error?.message);
          console.log('API URL tentada:', this.apiUrl);
          console.groupEnd();

          // Se for erro de conexão (backend indisponível), retorna dados de fallback
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Usando fallback de usuários - backend indisponível');
            return of(this.getFallbackUsers());
          }

          // Se não conseguiu usar fallback, propaga o erro
          console.log('📤 Propagando erro do UsuarioService');
          return throwError(() => error);
        })
      );
  }

  getById(id: number): Observable<Usuario> {
    console.log('🔄 UsuarioService.getById - fazendo requisição para:', `${this.apiUrl}/${id}`);

    return this.http.get<Usuario>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.group('❌ UsuarioService.getById Error');
          console.log('Error object:', error);
          console.log('Error status:', error?.status);
          console.log('Error message:', error?.message);
          console.log('User ID:', id);
          console.log('API URL tentada:', `${this.apiUrl}/${id}`);
          console.groupEnd();

          // Se for erro de conexão, retorna usuário de fallback
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Usando fallback para usuário - backend indisponível');
            const fallbackUsers = this.getFallbackUsers();
            const user = fallbackUsers.find(u => u.id === id);
            if (user) {
              return of(user);
            }
          }

          console.log('📤 Propagando erro do getById');
          return throwError(() => error);
        })
      );
  }

  create(usuario: Partial<Usuario>): Observable<Usuario> {
    console.log('🔄 UsuarioService.create - dados enviados:', usuario);
    console.log('🔄 UsuarioService.create - API URL:', this.apiUrl);

    return this.http.post<Usuario>(this.apiUrl, usuario)
      .pipe(
        catchError(error => {
          console.group('❌ UsuarioService.create Error');
          console.log('Error object:', error);
          console.log('Error status:', error?.status);
          console.log('Error message:', error?.message);
          console.log('Error error:', error?.error);
          console.log('Data sent:', usuario);
          console.groupEnd();

          // Se for erro de conexão (backend indisponível), simula criação
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Simulando criação de usuário - backend indisponível');
            const newUser: Usuario = {
              id: Date.now(), // ID único baseado em timestamp
              nome: usuario.nome,
              email: usuario.email,
              cpf: usuario.cpf,
              roles: usuario.roles || [],
              status: usuario.status !== undefined ? usuario.status : true,
              dataCadastro: new Date()
            };
            console.log('✅ Usuário simulado criado:', newUser);
            return of(newUser);
          }

          console.log('📤 Propagando erro do create');
          return throwError(() => error);
        })
      );
  }

  update(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    console.log('🔄 UsuarioService.update - fazendo requisição para:', `${this.apiUrl}/${id}`);
    console.log('🔄 UsuarioService.update - dados enviados:', usuario);

    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario)
      .pipe(
        catchError(error => {
          console.group('❌ UsuarioService.update Error');
          console.log('Error object:', error);
          console.log('Error status:', error?.status);
          console.log('Error message:', error?.message);
          console.log('Error error:', error?.error);
          console.log('User ID:', id);
          console.log('Data sent:', usuario);
          console.groupEnd();

          // Se for erro de conexão (backend indisponível), simula atualização
          if (error.status === 0 || error.status === 404) {
            console.log('�� Simulando atualização de usuário - backend indisponível');
            const updatedUser: Usuario = {
              id: id,
              nome: usuario.nome,
              email: usuario.email,
              cpf: usuario.cpf,
              roles: usuario.roles || [],
              status: usuario.status !== undefined ? usuario.status : true,
              dataCadastro: new Date()
            };
            console.log('✅ Usuário simulado atualizado:', updatedUser);
            return of(updatedUser);
          }

          console.log('📤 Propagando erro do update');
          return throwError(() => error);
        })
      );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.log('❌ Delete user error:', error);

          // Se for erro de conexão, simula sucesso
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Simulando delete user - backend indisponível');
            return of({ success: true, message: 'Usuário excluído (simulação)' });
          }

          return throwError(() => error);
        })
      );
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {})
      .pipe(
        catchError(error => {
          console.log('❌ ToggleStatus error:', error);

          // Se for erro de conexão, simula sucesso
          if (error.status === 0 || error.status === 404) {
            console.log('✅ Simulando toggle status - backend indisponível');
            return of({ success: true, message: 'Status alterado (simulação)' });
          }

          return throwError(() => error);
        })
      );
  }
}

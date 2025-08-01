import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ErrorHandlerService } from './error-handler.service';
import { 
  Usuario, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  ApiResponse, 
  UserRole 
} from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('current_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
        
        // Verificar se o token ainda é válido
        this.getProfile().subscribe({
          next: (profile) => {
            this.currentUserSubject.next(profile);
          },
          error: () => {
            this.logout();
          }
        });
      } catch (error) {
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login_check`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('access_token', response.token);
            this.isLoggedInSubject.next(true);

            // Buscar dados do usuário após login
            this.getProfile().subscribe({
              next: (user) => {
                this.currentUserSubject.next(user);
                localStorage.setItem('current_user', JSON.stringify(user));
              }
            });
          }
        }),
        catchError(error => {
          console.group('🔐 AuthService Login Error');
          console.log('Error received in AuthService:', error);
          console.log('Error type:', typeof error);
          console.log('Error status:', error?.status);
          console.log('Error message:', error?.message);
          console.log('Error keys:', error ? Object.keys(error) : 'null');
          console.groupEnd();

          // Fallback para demonstração quando backend não está disponível
          if (error.status === 0 || error.status === 404) {
            console.log('🔄 Using simulate login fallback');
            return this.simulateLogin(credentials);
          }

          console.log('📤 Throwing error from AuthService');
          return throwError(() => error);
        })
      );
  }

  private simulateLogin(credentials: LoginRequest): Observable<LoginResponse> {
    const validCredentials = [
      { email: 'admin@sistema.com', password: 'admin123', role: UserRole.ROLE_ADMIN },
      { email: 'professor@sistema.com', password: 'prof123', role: UserRole.ROLE_PROFESSOR },
      { email: 'aluno@sistema.com', password: 'aluno123', role: UserRole.ROLE_ALUNO }
    ];

    const user = validCredentials.find(cred =>
      cred.email === credentials.username && cred.password === credentials.password
    );

    if (user) {
      const mockUser: Usuario = {
        id: 1,
        nome: user.role === UserRole.ROLE_ADMIN ? 'Administrador' :
              user.role === UserRole.ROLE_PROFESSOR ? 'Professor Demo' : 'Aluno Demo',
        email: user.email,
        cpf: '12345678901',
        roles: [user.role],
        status: true
      };

      const mockToken = 'mock-jwt-token-' + Date.now();
      const response: LoginResponse = { token: mockToken };

      // Simular armazenamento
      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('current_user', JSON.stringify(mockUser));
      this.currentUserSubject.next(mockUser);
      this.isLoggedInSubject.next(true);

      return of(response).pipe(
        tap(() => {
          // Simular delay de rede
          setTimeout(() => {}, 500);
        })
      );
    } else {
      const errorObj = {
        status: 401,
        message: 'Credenciais inválidas',
        error: { message: 'Credenciais inválidas' }
      };
      return throwError(() => errorObj);
    }
  }

  register(userData: RegisterRequest): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(`${this.apiUrl}/register`, userData)
      .pipe(
        catchError(error => {
          console.error('Erro no registro:', error);
          return throwError(() => error);
        })
      );
  }

  getProfile(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/profile`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          localStorage.setItem('current_user', JSON.stringify(user));
        }),
        catchError(error => {
          console.group('❌ AuthService.getProfile Error');
          console.log('Error object:', error);
          console.log('Error status:', error?.status);
          console.log('Error message:', error?.message);
          console.log('API URL tentada:', `${this.apiUrl}/profile`);
          console.groupEnd();

          // Se for erro de conexão, limpeza segura
          if (error.status === 0 || error.status === 404 || error.status === 401) {
            console.log('✅ Limpando dados de autenticação devido a erro de perfil');
            this.logout();
          }

          console.log('📤 Propagando erro do getProfile');
          return throwError(() => error);
        })
      );
  }

  updateProfile(userData: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.apiUrl}/profile`, userData)
      .pipe(
        tap(response => {
          if (response.data) {
            this.currentUserSubject.next(response.data);
            localStorage.setItem('current_user', JSON.stringify(response.data));
          }
        }),
        catchError(error => {
          console.error('Erro ao atualizar perfil:', error);
          return throwError(() => error);
        })
      );
  }

  changePassword(passwords: { senhaAtual: string; novaSenha: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/change-password`, passwords)
      .pipe(
        catchError(error => {
          console.error('Erro ao alterar senha:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  // Getters de conveniência
  get currentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  get isAdmin(): boolean {
    const user = this.currentUser;
    return user?.roles?.includes(UserRole.ROLE_ADMIN) || false;
  }

  get isProfessor(): boolean {
    const user = this.currentUser;
    return user?.roles?.includes(UserRole.ROLE_PROFESSOR) || false;
  }

  get isAluno(): boolean {
    const user = this.currentUser;
    return user?.roles?.includes(UserRole.ROLE_ALUNO) || false;
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUser;
    return user?.roles?.includes(role) || false;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

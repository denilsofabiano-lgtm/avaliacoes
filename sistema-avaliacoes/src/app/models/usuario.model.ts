export interface Usuario {
  id?: number;
  dataCadastro?: string | Date;
  cpf?: string;
  nome?: string;
  email?: string;
  senha?: string;
  roles?: UserRole[];
  status?: boolean;
}

export enum UserRole {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_PROFESSOR = 'ROLE_PROFESSOR',
  ROLE_ALUNO = 'ROLE_ALUNO'
}

export interface LoginRequest {
  username: string; // Backend espera 'username' não 'email'
  password: string; // Backend espera 'password' não 'senha'
}

export interface LoginResponse {
  token: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  roles?: UserRole[];
  status?: boolean;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
  details?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

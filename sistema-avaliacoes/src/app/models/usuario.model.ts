export interface Usuario {
  id?: number;
  dataCadastro?: Date;
  cpf: string;
  nome: string;
  email: string;
  senha?: string;
  roles: UserRole[];
  status: boolean;
}

export enum UserRole {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_PROFESSOR = 'ROLE_PROFESSOR',
  ROLE_ALUNO = 'ROLE_ALUNO'
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

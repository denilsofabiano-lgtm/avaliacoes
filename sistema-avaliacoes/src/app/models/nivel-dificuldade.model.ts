export interface NivelDificuldade {
  id?: number;
  dataCadastro?: Date;
  descricao: string;
  status: boolean;
}

export enum NivelDificuldadeEnum {
  FACIL = 'Fácil',
  MEDIO = 'Médio',
  DIFICIL = 'Difícil'
}

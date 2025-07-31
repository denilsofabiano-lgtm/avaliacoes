export interface StatusAplicacao {
  id?: number;
  descricao: string;
  status: boolean;
}

export interface StatusQuestao {
  id?: number;
  descricao: string;
  status: boolean;
}

export interface StatusAvaliacao {
  id?: number;
  descricao: string;
  status: boolean;
}

export enum StatusAplicacaoEnum {
  PENDENTE = 0,
  INICIADO = 1,
  EM_ANDAMENTO = 2,
  CONCLUIDO = 3
}

export enum StatusQuestaoEnum {
  PENDENTE = 0,
  APROVADO = 1,
  CANCELADO = 2
}

export enum StatusAvaliacaoEnum {
  PENDENTE = 0,
  APROVADO = 1,
  CANCELADO = 2
}

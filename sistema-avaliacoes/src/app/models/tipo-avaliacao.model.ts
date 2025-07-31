export interface TipoAvaliacao {
  id?: number;
  dataCadastro?: Date;
  descricao: string;
  status: boolean;
}

export enum TipoAvaliacaoEnum {
  DIAGNOSTICA = 'Diagnóstica',
  PROCESSUAL = 'Processual',
  FINAL_CICLO = 'Final de Ciclo',
  CERTIFICADORA = 'Certificadora'
}

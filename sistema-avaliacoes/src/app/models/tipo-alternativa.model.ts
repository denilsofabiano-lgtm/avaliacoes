export interface TipoAlternativa {
  id?: number;
  dataCadastro?: Date;
  descricao: string;
  status: boolean;
}

export enum TipoAlternativaEnum {
  DISSERTATIVA = 'Dissertativa',
  MULTIPLA_ESCOLHA = 'Múltipla Escolha',
  TEXTO_REFERENCIA = 'Texto de Referência',
  IMAGEM_REFERENCIA = 'Imagem de Referência',
  IMAGEM_ALTERNATIVAS = 'Imagem nas Alternativas'
}

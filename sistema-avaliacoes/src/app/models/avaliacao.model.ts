import { Usuario } from './usuario.model';
import { TipoAvaliacao } from './tipo-avaliacao.model';
import { StatusAvaliacao } from './status.model';
import { Questao } from './questao.model';

export interface Avaliacao {
  id?: number;
  dataCadastro?: Date;
  tipoAvaliacaoId: number;
  tipoAvaliacao?: TipoAvaliacao;
  instrucao?: string;
  responsavelId: number;
  responsavel?: Usuario;
  statusAvaliacaoId: number;
  statusAvaliacao?: StatusAvaliacao;
  questoes?: Questao[];
}

export interface AvaliacaoQuestao {
  id?: number;
  dataCadastro?: Date;
  avaliacaoId: number;
  questaoId: number;
  avaliacao?: Avaliacao;
  questao?: Questao;
}

export interface AvaliacaoParametros {
  id?: number;
  avaliacaoId: number;
  dataAplicacao?: Date;
  usuarioId?: number;
  statusAplicacaoId?: number;
  status: boolean;
}

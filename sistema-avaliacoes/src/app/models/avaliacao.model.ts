import { Usuario } from './usuario.model';
import { TipoAvaliacao } from './tipo-avaliacao.model';
import { StatusAvaliacao } from './status.model';
import { Questao } from './questao.model';
import { Disciplina } from './disciplina.model';

export interface Avaliacao {
  id?: number;
  dataCadastro?: string;
  tipoAvaliacao?: TipoAvaliacao;
  instrucao?: string;
  responsavel?: Usuario;
  statusAvaliacao?: StatusAvaliacao;
  disciplina?: Disciplina;
  questoes?: Questao[];
  totalQuestoes?: number;
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

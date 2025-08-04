import { Avaliacao } from './avaliacao.model';
import { Questao } from './questao.model';

export interface AvaliacaoQuestao {
  id?: number;
  dataCadastro?: Date;
  avaliacaoId: number;
  avaliacao?: Avaliacao;
  questaoId: number;
  questao?: Questao;
  ordem?: number;
}

export interface AvaliacaoQuestaoRequest {
  avaliacaoId: number;
  questaoId: number;
  ordem?: number;
}

export interface AvaliacaoQuestaoResponse {
  message: string;
  data: AvaliacaoQuestao[];
  total?: number;
}

export interface ReordenarQuestoesRequest {
  ordens: { [questaoId: number]: number };
}

export interface AdicionarMultiplasQuestoesRequest {
  questoesIds: number[];
}

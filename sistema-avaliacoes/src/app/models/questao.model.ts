import { Disciplina } from './disciplina.model';
import { TipoAlternativa } from './tipo-alternativa.model';
import { NivelDificuldade } from './nivel-dificuldade.model';
import { StatusQuestao } from './status.model';

export interface QuestaoContexto {
  id?: number;
  dataCadastro?: Date;
  contexto: string;
  geradorIa: boolean;
  arquivoImagem?: string;
}

export interface Questao {
  id?: number;
  dataCadastro?: Date;
  questaoContextoId?: number;
  questaoContexto?: QuestaoContexto;
  pergunta: string;
  geradorIa: boolean;
  statusQuestaoId: number;
  statusQuestao?: StatusQuestao;
  disciplinaId?: number;
  disciplina?: Disciplina;
  pontuacao?: number;
  arquivoImagem?: string;
  tipoAlternativaId: number;
  tipoAlternativa?: TipoAlternativa;
  respostaCorreta?: string;
  nivelDificuldadeId?: number;
  nivelDificuldade?: NivelDificuldade;
  ciclo?: string;
  fase?: string;
  tema?: string;
  habilidades?: string;
  alternativas?: QuestaoAlternativa[];
}

export interface QuestaoAlternativa {
  id?: number;
  dataCadastro?: Date;
  questaoId: number;
  alternativa: string;
  conteudo: string;
  arquivoImagem?: string;
  correta: boolean;
}

export interface ProblemaQuestao {
  id?: number;
  dataCadastro?: Date;
  descricao: string;
  questaoId: number;
  questao?: Questao;
}

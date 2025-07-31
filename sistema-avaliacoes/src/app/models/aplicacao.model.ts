import { Usuario } from './usuario.model';
import { Avaliacao } from './avaliacao.model';
import { StatusAplicacao } from './status.model';
import { Questao, QuestaoAlternativa } from './questao.model';

export interface ParticipanteAvaliacao {
  id?: number;
  dataCadastro?: Date;
  avaliacaoId: number;
  avaliacao?: Avaliacao;
  usuarioId: number;
  usuario?: Usuario;
  ano?: string;
  escola?: string;
  turma?: string;
  disponivel: boolean;
  dataInicioAvaliacao?: Date;
  dataInicio?: Date;
  horaInicio?: string;
  dataFim?: Date;
  horaFim?: string;
  statusAplicacaoId: number;
  statusAplicacao?: StatusAplicacao;
  avaliado: boolean;
}

export interface AvaliacaoResposta {
  id?: number;
  dataCadastro?: Date;
  usuarioId: number;
  usuario?: Usuario;
  questaoId: number;
  questao?: Questao;
  resposta?: string;
  questaoAlternativaId?: number;
  questaoAlternativa?: QuestaoAlternativa;
  correta?: boolean;
  corrigidoPor?: 'I' | 'M'; // I = IA, M = Manual
  observacoes?: string;
  pontuacao?: number;
}

export interface ResumoAvaliacao {
  participante: ParticipanteAvaliacao;
  respostas: AvaliacaoResposta[];
  pontuacaoTotal: number;
  percentualAcerto: number;
  questoesCorretas: number;
  questoesTotais: number;
}

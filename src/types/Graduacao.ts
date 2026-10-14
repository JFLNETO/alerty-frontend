export interface Graduacao {
  id: number;
  idEmpresa: number;
  idServico: number;
  nome: string;
  ordem: number;
  requisitoDias: number;
  requisitoPresencas: number;
}

export interface GraduacaoStatus {
  idCliente: number;
  nomeCliente: string;
  idServico: number;
  nomeServico: string;
  idGraduacaoAtual: number;
  nomeGraduacaoAtual: string;
  dataUltimaGraduacao: string;
  idProximaGraduacao: number | null;
  nomeProximaGraduacao: string | null;
  diasNaGraduacaoAtual: number;
  presencasDesdeUltimaGraduacao: number;
  apto: boolean;
  progressoPercentual: number;
}

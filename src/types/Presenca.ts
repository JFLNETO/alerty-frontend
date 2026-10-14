export const STATUS_PRESENTE = 0;
export const STATUS_AUSENTE = 1;

export type StatusPresenca = typeof STATUS_PRESENTE | typeof STATUS_AUSENTE;

export interface AlunoChamada {
  idCliente: number;
  nome: string;
  matriculadoNestaTurma: boolean;
  status: StatusPresenca | null;
}

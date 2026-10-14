export interface Turma {
  id: number;
  idEmpresa: number;
  idServico: number;
  nome: string | null;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  ativo: boolean;
}

export const DIAS_SEMANA = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export function formatarDiaHorario(turma: Turma): string {
  const dia = DIAS_SEMANA[turma.diaSemana] ?? "-";
  return `${dia}, ${turma.horaInicio.slice(0, 5)} - ${turma.horaFim.slice(0, 5)}`;
}

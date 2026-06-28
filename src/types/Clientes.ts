export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  idCliente: string;
  ativo: boolean;
  dataVencimento: string;
  dataUltimoPagamento: string | null;
  idServicos: number[];
  selos: number[];
  idEmpresa: number;
  urlFoto: string | null;
}

export type StatusCliente = "vencido" | "hoje" | "em-dia";

export function getStatusCliente(dataVencimento: string): StatusCliente {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const vencimento = new Date(dataVencimento + "T00:00:00");
  vencimento.setHours(0, 0, 0, 0);

  const diffMs = vencimento.getTime() - hoje.getTime();
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 0) return "vencido";
  if (diffDias === 0) return "hoje";
  return "em-dia";
}

export function formatarData(data: string): string {
  const d = new Date(data + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

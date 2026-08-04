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

/** Remove tudo que não for dígito — é isso que deve ser salvo no backend. */
export function apenasDigitos(telefone: string): string {
  return telefone.replace(/\D/g, "").slice(0, 11);
}

/** Formata dígitos de telefone para exibição no padrão (79) 91234-5678. */
export function formatarTelefone(telefone: string): string {
  const digitos = apenasDigitos(telefone);
  const ddd = digitos.slice(0, 2);
  const parte1 = digitos.slice(2, 7);
  const parte2 = digitos.slice(7, 11);

  let resultado = "";
  if (ddd) resultado += `(${ddd}`;
  if (digitos.length >= 2) resultado += ") ";
  resultado += parte1;
  if (parte2) resultado += `-${parte2}`;
  return resultado;
}

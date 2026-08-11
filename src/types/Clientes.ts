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

/**
 * Remove tudo que não for dígito e o DDI 55, se vier junto (ex: número copiado do próprio
 * WhatsApp, no formato +55 79 98815-6894) — o campo sempre guarda só DDD + número, no máximo
 * 11 dígitos.
 */
export function apenasDigitos(telefone: string): string {
  const digitos = telefone.replace(/\D/g, "");
  const semDdi = digitos.length > 11 && digitos.startsWith("55") ? digitos.slice(2) : digitos;
  return semDdi.slice(0, 11);
}

/**
 * Formata dígitos de telefone para exibição.
 * Celular (DDD + 9 dígitos): (79) 91234-5678 — traço entre os 5 primeiros e os 4 últimos.
 * Fixo (DDD + 8 dígitos): (79) 9123-4567 — traço entre os 4 primeiros e os 4 últimos.
 */
export function formatarTelefone(telefone: string): string {
  const digitos = apenasDigitos(telefone);
  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);

  const tamanhoParte1 = numero.length > 8 ? 5 : 4;
  const parte1 = numero.slice(0, tamanhoParte1);
  const parte2 = numero.slice(tamanhoParte1, tamanhoParte1 + 4);

  let resultado = "";
  if (ddd) resultado += `(${ddd}`;
  if (digitos.length >= 2) resultado += ") ";
  resultado += parte1;
  if (parte2) resultado += `-${parte2}`;
  return resultado;
}

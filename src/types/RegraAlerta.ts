// Mesmos valores do enum TipoAlerta no backend (serializado como número).
export const TIPO_ANTES = 0;
export const TIPO_NO_DIA = 1;
export const TIPO_APOS = 2;

export type TipoAlerta = typeof TIPO_ANTES | typeof TIPO_NO_DIA | typeof TIPO_APOS;

export interface RegraAlerta {
  id: number;
  idEmpresa: number;
  tipo: TipoAlerta;
  diasOffset: number;
  mensagem: string;
  ativo: boolean;
  createdDate: string;
}

export function descreverRegra(regra: Pick<RegraAlerta, "tipo" | "diasOffset">): string {
  if (regra.tipo === TIPO_NO_DIA) return "No dia do vencimento";
  if (regra.tipo === TIPO_ANTES) return `${regra.diasOffset} dia(s) antes do vencimento`;
  return `${regra.diasOffset} dia(s) após o vencimento`;
}

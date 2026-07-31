import type { TipoAlerta } from "./RegraAlerta";

export interface AlertaPendente {
  idCliente: number;
  idRegraAlerta: number;
  idEmpresa: number;
  nome: string | null;
  empresa: string | null;
  telefone: string | null;
  tipo: TipoAlerta;
  diasOffset: number;
  dataVencimento: string;
}

export interface SimulacaoAlertasResponse {
  total: number;
  pendentes: AlertaPendente[];
}
